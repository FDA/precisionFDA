import boto3
import os
import sys
import time
import yaml
import re
import json
from botocore.exceptions import WaiterError, ClientError
from concurrent.futures import ThreadPoolExecutor, as_completed


class ServiceDeploymentError(Exception):
    """Raised when a service fails to deploy."""

    pass


class EcsDeployer:
    """
    Manages the configuration and deployment of services to an AWS ECS Cluster.
    Supports staged, capacity-aware parallel deployment.
    """

    def __init__(self, services_file="services.yml"):
        self.account_id = os.getenv("ACCOUNT_ID")
        self.region = os.getenv("AWS_REGION", "us-east-1")
        self.environment = os.getenv("ENVIRONMENT")
        self.ecr_account = "991033550868"
        self.branch = os.environ.get("GIT_BRANCH")
        self.services_file = services_file
        # Track previously deployed services for rollback
        self.deployed_services = {}

        self.ssm_prefix = f"/pfda/{self.environment}/app"
        self.cluster_name = f"{self.environment}-private"
        self.service_connect_namespace = f"pfda-{self.environment}-ecs-namespace"

        self.image_tags = {
            "WEB": os.getenv("WEB_TAG"),
            "SERVER": os.getenv("SERVER_TAG"),
            "NGINX": os.getenv("NGINX_TAG"),
            "DOCS": os.getenv("DOCS_TAG"),
        }

        force_services_str = os.getenv("FORCE_DEPLOY_SERVICES", "")
        self.force_services = {s.strip() for s in force_services_str.split(",") if s.strip()}

        # --- Boto3 Clients ---
        self.ecs_client = boto3.client("ecs", region_name=self.region)
        self.ec2_client = boto3.client("ec2", region_name=self.region)
        self.elbv2_client = boto3.client("elbv2", region_name=self.region)
        self.ssm_client = boto3.client("ssm", region_name=self.region)

        print(f"Initialized Deployer for Environment: {self.environment} (Region: {self.region})")

        # VPC/subnets
        self.vpc_id = self._get_vpc_id()
        self.private_subnets = self._get_private_subnets(self.vpc_id)

        # Prepare data
        self.services = self._load_services()
        self._ssm_parameters = self._fetch_all_ssm_parameters()
        self._resource_overrides = self._get_services_resource_overrides()

        # Define deployment stages
        self.stages = [
            ["pfda-db-migrate"],
            ["pfda-nodejs-api", "pfda-nodejs-api-internal", "pfda-nodejs-worker", "pfda-nodejs-admin-platform-client"],
            ["pfda-sidekiq", "pfda-web", "pfda-docs"],
            ["pfda-nginx"],
        ]

        self.prod_branches_patterns = [r"^master$",r"^production$",r"^release.*",r"^staging.*"]

    # ---------------------- Deployment Orchestration ----------------------

    def deploy_all_services(self):
        """Deploy services in staged, capacity-aware batches."""

        try:
            for stage in self.stages:
                stage_services = {name: self.services[name] for name in stage if name in self.services}

                # Apply SSM overrides
                for svc_name, svc_conf in stage_services.items():
                    self._apply_resource_overrides(svc_name, svc_conf)

                self._execute_in_capacity_aware_batches(
                    stage_services,
                    get_resource_requirements=lambda svc, conf: {
                        "CPU": conf["container"]["cpu"],
                        "MEMORY": conf["container"]["memoryReservation"],
                        "DESIRED_COUNT": conf.get("desiredCount", 1),
                    },
                    action=lambda svc, conf: self._deploy_single_service(svc, conf, svc in self.force_services),
                )
        except Exception as e:
            print(f"Deployment error: {e}")
            self.rollback_deployed_services()
            sys.exit(1)

        print("\nDeployment run complete!")

    def _deploy_single_service(self, svc_name, svc_conf, force=False):
        """Deploy a single service: register task definition + create/update service."""
        prev_task_def_arn = self._get_current_task_definition_arn(svc_name)
        task_def_arn = self.register_task_definition(svc_name, svc_conf, force)

        if task_def_arn:
            # Only if a new task definition was registered, deployment for a service will happen
            if prev_task_def_arn:
                self.deployed_services[svc_name] = prev_task_def_arn
            if svc_name == "pfda-db-migrate":
                self.run_one_off_task(svc_name, task_def_arn)
            else:
                self.create_or_update_service(svc_name, svc_conf, task_def_arn)

    # ---------------------- Rollback ----------------------

    def rollback_deployed_services(self):
        """Rollback previously deployed services stage by stage in parallel."""
        if not self.deployed_services:
            print("No services to rollback.")
            return

        print("\nRolling back previously updated services stage by stage...")
        for stage in self.stages:
            stage_services = {
                s: {"task_def": self.deployed_services[s], "config": self.services[s]} for s in stage if s in self.deployed_services
            }
            if not stage_services:
                continue

            self._execute_in_capacity_aware_batches(
                stage_services,
                get_resource_requirements=lambda svc, ctx: {
                    "CPU": ctx["config"]["container"]["cpu"] if ctx.get("config") else 0,
                    "MEMORY": ctx["config"]["container"]["memoryReservation"] if ctx.get("config") else 0,
                    "DESIRED_COUNT": ctx["config"].get("desiredCount", 1),
                },
                action=lambda svc, ctx: (
                    self._rollback_one_off_task(svc, ctx["task_def"]) if svc == "pfda-db-migrate" else self._rollback_single_service(svc, ctx["task_def"])
                ),
            )

    def _rollback_single_service(self, svc_name, task_def_arn):
        """Rollback a single service to a previous task definition."""
        print(f"↩ Rolling back {svc_name} to {task_def_arn}...")
        self.ecs_client.update_service(
            cluster=self.cluster_name,
            service=svc_name,
            taskDefinition=task_def_arn,
            forceNewDeployment=True,
        )
        self.wait_for_service_stable_or_failures(svc_name, task_def_arn)
        print(f"{svc_name} rolled back successfully.")

    def _rollback_one_off_task(self, svc_name, prev_task_def):
        """Run the previous task definition of a one-off task."""

        if not prev_task_def:
            print(f"No previous task definition found for {svc_name}, skipping rollback")
            return
        print(f"Rolling back one-off task {svc_name} to previous task definition {prev_task_def}...")
        self.run_one_off_task(svc_name, prev_task_def)



    # ---------------------- ECS Deployment Functions ----------------------

    def _get_cluster_available_resources(self):
        """Return total remaining CPU and memory across ECS container instances."""
        res = {"CPU": 0, "MEMORY": 0}
        instance_arns = self.ecs_client.list_container_instances(cluster=self.cluster_name)["containerInstanceArns"]
        if not instance_arns:
            return res

        desc = self.ecs_client.describe_container_instances(cluster=self.cluster_name, containerInstances=instance_arns)
        for inst in desc["containerInstances"]:
            for r in inst.get("remainingResources", []):
                if r["name"] == "CPU":
                    res["CPU"] += r["integerValue"]
                elif r["name"] == "MEMORY":
                    res["MEMORY"] += r["integerValue"]
        print(f"Cluster available resources: CPU={res['CPU']} MEM={res['MEMORY']}")
        return res

    # ---------------------- ECS Deployment Functions ----------------------

    def register_task_definition(self, service_name, service_config, force):
        """Register or update ECS task definition for a service."""
        image_key = service_config["imageName"].upper()
        tag = self.image_tags.get(image_key)
        if not tag:
            raise ValueError(f"Image tag not found for key: {image_key}")
        image_uri = self.get_image_uri(image_key, tag)

        ecs_secrets = self._get_ssm_secrets(service_name)
        execution_role_arn = f"arn:aws:iam::{self.account_id}:role/ecs-task-execution-role-pfda-{self.environment}"
        container_def = self._build_container_definition(service_name, service_config, image_uri, ecs_secrets)
        desired_count = service_config["desiredCount"]

        # Check if task definition changed (image or config)
        if not force and not self._task_definition_changed(service_name, container_def, desired_count):
            print(f"Skipping deployment for {service_name} — no changes detected")
            return

        print(f"Registering task definition for {service_name} with image tag: {tag}")
        response = self.ecs_client.register_task_definition(
            family=f"{service_name}-task-{self.environment}",
            executionRoleArn=execution_role_arn,
            networkMode="awsvpc",
            containerDefinitions=[container_def],
            requiresCompatibilities=["EC2"],
        )
        return response["taskDefinition"]["taskDefinitionArn"]

    def _execute_in_capacity_aware_batches(self, services, get_resource_requirements, action, attempt=1, max_retries=5, wait_interval=30):
        """
        Execute services in batches respecting cluster capacity.
        """
        if not services:
            return

        available = self._get_cluster_available_resources()
        batch = []

        for svc_name, context in services.items():
            res_req = get_resource_requirements(svc_name, context)
            cpu_per_task = res_req["CPU"]
            mem_per_task = res_req["MEMORY"]
            desired_count = res_req["DESIRED_COUNT"]

            # Multiply by desired_count
            cpu_needed = cpu_per_task * desired_count
            mem_needed = mem_per_task * desired_count

            if cpu_needed <= available["CPU"] and mem_needed <= available["MEMORY"]:
                batch.append((svc_name, context))
                available["CPU"] -= cpu_needed
                available["MEMORY"] -= mem_needed
            else:
                print(f"Not enough resources for {svc_name}, will retry later.")

        if not batch:
            if attempt <= max_retries:
                print(f"[Attempt {attempt}/{max_retries}] Waiting {wait_interval}s for cluster capacity...")
                time.sleep(wait_interval)
                self._execute_in_capacity_aware_batches(
                    services,
                    get_resource_requirements,
                    action,
                    attempt=attempt + 1,
                    max_retries=max_retries,
                    wait_interval=wait_interval,
                )
                return
            else:
                print(f"Services could not be executed due to capacity: {', '.join(services.keys())}")
                return

        # Execute batch in parallel
        with ThreadPoolExecutor(max_workers=len(batch)) as executor:
            futures = {executor.submit(action, svc_name, context): svc_name for svc_name, context in batch}
            for future in as_completed(futures):
                svc_name = futures[future]
                try:
                    future.result()
                except Exception as e:
                    print(f"Action failed for {svc_name}: {e}")
                    raise

        # Recursively execute remaining services
        remaining_services = {name: ctx for name, ctx in services.items() if name not in dict(batch)}
        if remaining_services:
            self._execute_in_capacity_aware_batches(
                remaining_services,
                get_resource_requirements,
                action,
                attempt=1,
                max_retries=max_retries,
                wait_interval=wait_interval,
            )

    def create_or_update_service(self, service_name, service_config, task_definition_arn):
        """Creates a new ECS service or updates an existing one if the task definition changed."""

        service_args = {
            "cluster": self.cluster_name,
            "serviceName": service_name,
            "taskDefinition": task_definition_arn,
            "desiredCount": service_config.get("desiredCount", 1),
            "launchType": "EC2",
            "networkConfiguration": self._get_network_config(service_config),
            "deploymentConfiguration": {
                "maximumPercent": 200,
                "minimumHealthyPercent": 50,
                "deploymentCircuitBreaker": {"enable": True, "rollback": True},
            },
        }

        lb_conf = self._get_load_balancers_conf(service_name, service_config)
        if lb_conf:
            service_args["loadBalancers"] = lb_conf

        sc_conf = self._get_service_connect_conf(service_name, service_config)
        if sc_conf:
            service_args["serviceConnectConfiguration"] = sc_conf

        if self._is_new_service(service_name):
            print(f"Creating ECS service {service_name}...")
            self.ecs_client.create_service(**service_args)
        else:
            print(f"Updating ECS service {service_name}...")
            self.ecs_client.update_service(
                cluster=self.cluster_name,
                service=service_name,
                taskDefinition=task_definition_arn,
                desiredCount=service_config.get("desiredCount", 1),
                forceNewDeployment=True,
            )

        print(f"Waiting for ECS service {service_name} to become stable...")
        self.wait_for_service_stable_or_failures(service_name, task_definition_arn)

    def wait_for_service_stable_or_failures(self, service_name, new_task_def_arn, max_failures=3, delay=20, max_attempts=40):
        """
        Monitor ECS service deployment in real-time. Polls every 20 seconds up to 40 times.
        Exits early if the service becomes healthy.
        Raises ServiceDeploymentError if too many tasks fail.
        """
        failed_tasks = set()
        FAILURE_REASONS = [
            "cannotpullcontainererror",
            "resourceinitializationerror",
            "task failed",
            "container essential_container exited",
        ]

        for attempt in range(max_attempts):
            print(f"[Attempt {attempt+1}] Checking ECS service stability for {service_name}...")

            primary = self._get_primary_deployment(service_name, new_task_def_arn)
            if not primary:
                time.sleep(delay)
                continue

            if self._is_service_healthy(primary, new_task_def_arn):
                print(f"ECS service {service_name} is stable and healthy!")
                return

            self._check_stopped_tasks_for_failures(service_name, new_task_def_arn, failed_tasks, FAILURE_REASONS, max_failures)

            time.sleep(delay)

        raise ServiceDeploymentError(
            f"Service {service_name} did not stabilize after {max_attempts} attempts ({delay * max_attempts}s timeout)."
        )

    def run_one_off_task(self, service_name, task_def_arn):
        """
        Run a one-off ECS task (e.g., DB migrations).
        Waits for it to finish and raises an exception if it fails.
        """
        if not task_def_arn:
            raise ValueError(f"No task definition found for {service_name}")

        print(f"Starting one-off task {service_name} using task definition {task_def_arn}...")

        response = self.ecs_client.run_task(
            cluster=self.cluster_name,
            taskDefinition=task_def_arn,
            count=1,
            launchType="EC2",
            networkConfiguration={
                "awsvpcConfiguration": {
                    "subnets": self.private_subnets,
                    "securityGroups": self._get_sg_ids_by_name(["common-sg"]),
                    "assignPublicIp": "DISABLED",
                }
            },
        )

        task_arn = response["tasks"][0]["taskArn"]
        print(f"Waiting for {service_name} task to finish...")

        # Wait for the task to stop
        waiter = self.ecs_client.get_waiter("tasks_stopped")
        waiter.wait(cluster=self.cluster_name, tasks=[task_arn])

        # Check exit code
        desc = self.ecs_client.describe_tasks(cluster=self.cluster_name, tasks=[task_arn])
        exit_code = desc["tasks"][0]["containers"][0].get("exitCode")
        if exit_code != 0:
            raise ServiceDeploymentError(f"One-off task {service_name} failed with exit code {exit_code}")

        print(f"One-off task {service_name} completed successfully!")


    # ---------------------- Helper Functions ----------------------

    def _load_services(self):
        """Load services.yml and merge default + environment overrides."""
        with open(self.services_file) as f:
            config = yaml.safe_load(f)["services"]

        default_services = config.get("default", {})
        env_services = config.get(self.environment, {})
        merged = {}

        for svc_name, svc_conf in default_services.items():
            merged[svc_name] = svc_conf.copy()
            if svc_name in env_services:
                merged[svc_name].update(env_services[svc_name])

        return merged

    def _get_current_task_definition_arn(self, service_name):
        """Return the ARN of the currently running task definition, or None."""
        response = self.ecs_client.describe_services(cluster=self.cluster_name, services=[service_name])
        services = response.get("services", [])
        if not services or services[0]["status"] == "INACTIVE":
            return None
        return services[0]["taskDefinition"]

    def _normalize_port_mappings(self, port_mappings):
        return [{k: pm[k] for k in ("containerPort", "protocol", "name") if k in pm} for pm in port_mappings]

    def _task_definition_changed(self, service_name, new_container_def, desired_count):
        """
        Compare current ECS task definition with new container definition.
        Returns True if image or any relevant config has changed.
        """
        current_task_def_arn = self._get_current_task_definition_arn(service_name)
        if not current_task_def_arn:
            return True

        current_task_def = self.ecs_client.describe_task_definition(taskDefinition=current_task_def_arn)["taskDefinition"]
        current_container_def = current_task_def["containerDefinitions"][0]

        # Fields to compare
        keys_to_compare = [
            "image",
            "cpu",
            "memoryReservation",
            "portMappings",
            "secrets",
            "command",
            "entryPoint",
            "healthCheck",
        ]
        current_subset = {k: current_container_def.get(k) for k in keys_to_compare}
        new_subset = {k: new_container_def.get(k) for k in keys_to_compare}

        current_subset["portMappings"] = self._normalize_port_mappings(current_subset["portMappings"])
        new_subset["portMappings"] = self._normalize_port_mappings(new_subset["portMappings"])

        # Compare only image hash instead of full image string
        current_subset["image"] = self._extract_image_hash(current_subset["image"])
        new_subset["image"] = self._extract_image_hash(new_subset["image"])

        if current_subset != new_subset:
            print(f"Detected changes in task definition for {service_name}")
            return True

        if desired_count is not None:
            response = self.ecs_client.describe_services(cluster=self.cluster_name, services=[service_name])
            current_desired = response["services"][0]["desiredCount"]
            if current_desired != desired_count:
                print(f"Desired count changed for {service_name}: {current_desired} -> {desired_count}")
                return True

        return False

    def _build_container_definition(self, service_name, service_config, image_uri, ecs_secrets):
        """Build ECS container definition."""
        container_def = {
            "name": service_name,
            "image": image_uri,
            "essential": True,
            "cpu": service_config["container"].get("cpu"),
            "memoryReservation": service_config["container"].get("memoryReservation"),
            "portMappings": [{"containerPort": service_config.get("containerPort"), "protocol": "tcp", "name": "https"}],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": f"/ecs/{self.cluster_name}/{service_name}",
                    "awslogs-region": self.region,
                    "awslogs-stream-prefix": "ecs",
                    "awslogs-create-group": "true"
                },
            },
            "secrets": ecs_secrets,
        }
        for field in ["command", "entryPoint"]:
            if field in service_config:
                container_def[field] = service_config[field]

        if "healthCheck" in service_config:
            hc = service_config["healthCheck"]
            required = ["command"]
            for key in required:
                if key not in hc:
                    raise ValueError(f"Missing required healthCheck key '{key}' for service {service_name}")
            container_def["healthCheck"] = hc

        return container_def

    def _get_network_config(self, service_config):
        sg_names = [sg["name"] for sg in service_config.get("serviceConnect", {}).get("securityGroups", [])]
        sg_ids = self._get_sg_ids_by_name(sg_names)
        return {
            "awsvpcConfiguration": {
                "subnets": self.private_subnets,
                "securityGroups": sg_ids,
                "assignPublicIp": "DISABLED",
            }
        }

    def _get_service_connect_conf(self, service_name, service_config):
        if "serviceConnect" not in service_config:
            return None
        return {
            "enabled": True,
            "namespace": self.service_connect_namespace,
            "services": [
                {
                    "portName": "https",
                    "discoveryName": service_name,
                    "clientAliases": [{"port": service_config["containerPort"], "dnsName": service_name}],
                }
            ],
        }

    def _get_load_balancers_conf(self, service_name, service_config):
        if "targetGroupName" not in service_config:
            return None
        tg_arn = self._get_target_group_arn(f'pfda-{self.environment}-{service_config["targetGroupName"]}')
        return [{"targetGroupArn": tg_arn, "containerName": service_name, "containerPort": service_config["containerPort"]}]

    def _is_new_service(self, service_name):
        response = self.ecs_client.describe_services(cluster=self.cluster_name, services=[service_name])
        return not response["services"] or response["services"][0]["status"] == "INACTIVE"

    def _get_vpc_id(self):
        vpcs = self.ec2_client.describe_vpcs(Filters=[{"Name": "tag:Name", "Values": [f"pfda-{self.environment}-vpc"]}])
        return vpcs["Vpcs"][0]["VpcId"]

    def _get_private_subnets(self, vpc_id):
        subnets = self.ec2_client.describe_subnets(
            Filters=[{"Name": "vpc-id", "Values": [vpc_id]}, {"Name": "tag:Name", "Values": ["*private*"]}]
        )
        return [subnet["SubnetId"] for subnet in subnets["Subnets"]]

    def _get_sg_ids_by_name(self, names):
        if not names:
            return []
        full_names = [f"pfda-{self.environment}-ecs-{name}" for name in names]
        response = self.ec2_client.describe_security_groups(Filters=[{"Name": "group-name", "Values": full_names}])
        return [sg["GroupId"] for sg in response["SecurityGroups"]]

    def _get_target_group_arn(self, name):
        response = self.elbv2_client.describe_target_groups(Names=[name])
        return response["TargetGroups"][0]["TargetGroupArn"]

    def _fetch_all_ssm_parameters(self):
        """Fetch all parameters under the prefix once and cache them."""
        params = []
        next_token = None
        while True:
            kwargs = {"Path": self.ssm_prefix, "WithDecryption": True, "Recursive": True}
            if next_token:
                kwargs["NextToken"] = next_token
            response = self.ssm_client.get_parameters_by_path(**kwargs)
            params.extend(response.get("Parameters", []))
            next_token = response.get("NextToken")
            if not next_token:
                break

        return params

    def _get_ssm_secrets(self, service_name):
        """Retrieve SSM parameters for ECS secrets, skipping nginx."""

        ecs_secrets = []
        exclusions = ["nginx", "docs"]
        for param in self._ssm_parameters:
            if param["Name"].endswith("/ssl_configuration/private_key"):
                ecs_secrets.append({"name": "SSL_KEY", "valueFrom": param["Name"]})
            elif param["Name"].endswith("/ssl_configuration/certificate"):
                ecs_secrets.append({"name": "SSL_CERT", "valueFrom": param["Name"]})
            elif not any(excl in service_name.lower() for excl in exclusions):
                # Include other parameters only if service is not Nginx
                ecs_secrets.append({"name": param["Name"].split("/")[-1], "valueFrom": param["Name"]})
        return ecs_secrets

    def _get_services_resource_overrides(self):
        """
        Returns resource overrides for all services from SSM.
        If no overrides are found, returns an empty dict.
        """
        param_name = f"{self.ssm_prefix}/service_resources"

        param = next((p for p in self._ssm_parameters if p["Name"] == param_name), None)
        if not param:
            return {}

        try:
            return json.loads(param["Value"])
        except json.JSONDecodeError:
            print(f"SSM parameter {param_name} is not valid JSON")
            return {}

    def _apply_resource_overrides(self, svc_name, svc_conf):
        """
        Override resource config
        """
        overrides = self._resource_overrides.get(svc_name, {})
        if not overrides:
            return

        container = svc_conf.get("container", {})

        if "cpu" in overrides:
            container["cpu"] = overrides["cpu"]
        if "memory" in overrides:
            container["memoryReservation"] = overrides["memory"]
        if "desiredCount" in overrides:
            svc_conf["desiredCount"] = overrides["desiredCount"]

    def _get_primary_deployment(self, service_name, new_task_def_arn):
        """Return the primary deployment for the service matching the new task definition."""
        try:
            svc = self.ecs_client.describe_services(cluster=self.cluster_name, services=[service_name])["services"][0]
        except ClientError as e:
            print(f"Error describing service {service_name}: {e}")
            return None

        deployments = svc.get("deployments", [])
        primary = next((d for d in deployments if d["status"] == "PRIMARY" and d.get("taskDefinition") == new_task_def_arn), None)
        return primary

    def _is_service_healthy(self, primary, new_task_def_arn):
        """Return True if the primary deployment is healthy and matches the new task definition."""
        return (
            primary
            and primary.get("taskDefinition") == new_task_def_arn
            and primary.get("rolloutState") == "COMPLETED"
            and primary.get("runningCount", 0) == primary.get("desiredCount", 0)
        )

    def _check_stopped_tasks_for_failures(self, service_name, new_task_def_arn, failed_tasks, failure_reasons, max_failures):
        """Check STOPPED tasks for failures and raise exception if threshold exceeded."""
        stopped_tasks = self.ecs_client.list_tasks(cluster=self.cluster_name, serviceName=service_name, desiredStatus="STOPPED").get(
            "taskArns", []
        )

        if not stopped_tasks:
            return

        tasks_desc = self.ecs_client.describe_tasks(cluster=self.cluster_name, tasks=stopped_tasks)["tasks"]

        for task in tasks_desc:
            task_arn = task["taskArn"]
            task_def = task.get("taskDefinitionArn")
            task_stopped_reason = task.get("stoppedReason", "").lower()

            if task_def != new_task_def_arn or task_arn in failed_tasks:
                continue

            is_failure = False
            if any(reason in task_stopped_reason for reason in failure_reasons):
                is_failure = True

            for container in task.get("containers", []):
                if container.get("exitCode") not in (0, None):
                    is_failure = True
                    break

            if is_failure:
                failed_tasks.add(task_arn)
                failed_containers = [c["name"] for c in task.get("containers", []) if c.get("exitCode") not in (0, None)]
                print(
                    f"Task {task_arn} failed. Containers: {failed_containers}. Failure Count: {len(failed_tasks)}. Reason: {task_stopped_reason}"
                )

        if len(failed_tasks) >= max_failures:
            print(f"Maximum failure threshold ({max_failures}) reached. Initiating rollback via exception.")
            raise ServiceDeploymentError(f"Deployment failed for {service_name}: {len(failed_tasks)} tasks failed.")


    def get_image_uri(self, image_key, tag):
        """
        Returns the ECR image URI, adding 'prod/' for production branches.
        Matches branch against regex patterns in self.prod_branches_patterns.
        """
        if any(re.match(pattern, self.branch) for pattern in self.prod_branches_patterns):
            prefix = "prod/"
        else:
            prefix = ""
        return f"{self.ecr_account}.dkr.ecr.{self.region}.amazonaws.com/pfda/{prefix}{image_key.lower()}:{tag}"

    def _extract_image_hash(self, image_uri):
        """
        Extract only the hash from an ECR image tag.
        """
        if not image_uri:
            return ""

        # Get the tag part after colon
        tag = image_uri.split(":")[-1]

        # Split by hyphen and take the second-to-last part (the hash)
        parts = tag.rsplit("-", 2)
        if len(parts) >= 2:
            return parts[-2]

        return tag


if __name__ == "__main__":
    deployer = EcsDeployer()
    deployer.deploy_all_services()

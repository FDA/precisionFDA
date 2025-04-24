import boto3
import os
import sys
import json

# AWS Account and Region
ACCOUNT_ID = os.getenv("ACCOUNT_ID")
REGION = os.getenv("AWS_REGION")

# Environment-specific variables
ENVIRONMENT = os.getenv("ENVIRONMENT")

# Repository and Image configuration
REPOSITORY_NAME = "pfda/fumadocs"
ORCH_ACCOUNT = "991033550868"
REPO_URI = f"{ORCH_ACCOUNT}.dkr.ecr.{REGION}.amazonaws.com/{REPOSITORY_NAME}"
IMAGE_TAG = os.getenv("IMAGE_TAG")
IMAGE_URI = f"{REPO_URI}:{IMAGE_TAG}"

# ECS-related parameter
DESIRED_COUNT = 1
CPU = "1024"
MEMORY = "2048"
ECS_NAME = f"pfda-fumadocs-{ENVIRONMENT}"

# Network and Security Group settings
VPC_NAME = f"pfda-{ENVIRONMENT}-vpc"
SECURITY_GROUP_NAME = f"pfda-{ENVIRONMENT}-fumadocs-sg"
ALB_NAME = f"pfda-{ENVIRONMENT}-alb"
TARGET_GROUP_NAME = f"pfda-{ENVIRONMENT}-fumadocs-tg"

def register_task_definition(ecs_client):
    """
    Register a new ECS task definition or create a new revision if it already exists.
    """
    task_role_arn = f"arn:aws:iam::{ACCOUNT_ID}:role/ecs-task-role-pfda-fumadocs-{ENVIRONMENT}"
    execution_role_arn = f"arn:aws:iam::{ACCOUNT_ID}:role/ecs-task-execution-role-pfda-fumadocs-{ENVIRONMENT}"

    try:
        task_definitions = ecs_client.describe_task_definition(taskDefinition=ECS_NAME)
        revision = task_definitions["taskDefinition"]["revision"]
        print(f"Existing task definition found, creating new revision (current: {revision})")
    except ecs_client.exceptions.ClientException:
        print("Task definition not found, creating new one")

    try:
        response = ecs_client.register_task_definition(
            family=ECS_NAME,
            executionRoleArn=execution_role_arn,
            taskRoleArn=task_role_arn,
            networkMode="awsvpc",
            cpu=CPU,
            memory=MEMORY,
            requiresCompatibilities=["FARGATE"],
            containerDefinitions=[
                {
                    "name": ECS_NAME,
                    "image": IMAGE_URI,
                    "essential": True,
                    "portMappings": [{"containerPort": 4040, "hostPort": 4040, "protocol": "tcp"}],
                    "logConfiguration": {
                        "logDriver": "awslogs",
                        "options": {
                            "awslogs-group": f"ecs/{ENVIRONMENT}-private-cluster",
                            "mode": "non-blocking",
                            "awslogs-create-group": "true",
                            "max-buffer-size": "25m",
                            "awslogs-region": REGION,
                            "awslogs-stream-prefix": "ecs",
                        },
                    },
                }
            ],
            runtimePlatform={"operatingSystemFamily": "LINUX", "cpuArchitecture": "X86_64"},
        )
    except ecs_client.exceptions.ClientException as e:
        raise Exception(f"Failed to register task definition: {str(e)}")

    return response["taskDefinition"]["taskDefinitionArn"]

def update_ecs_service(task_definition, ecs_client, ec2_client):
    """
    Update an existing ECS service or create a new one if it doesn't exist.
    """
    cluster_name = f"{ENVIRONMENT}-private"
    print(f"Cluster name: {cluster_name}")

    try:
        vpc_id = get_vpc_id(ec2_client)
        subnets = get_private_subnets(vpc_id, ec2_client)
        security_group_id = get_security_group_id(ec2_client)

        # Check if the service exists
        response = ecs_client.describe_services(cluster=cluster_name, services=[ECS_NAME])
        if not response["services"]:
            # Service does not exist, so we proceed to create it
            print(f"Service {ECS_NAME} not found, creating new one")
            ecs_client.create_service(
                cluster=cluster_name,
                serviceName=ECS_NAME,
                taskDefinition=task_definition,
                launchType="FARGATE",
                desiredCount=DESIRED_COUNT,
                networkConfiguration={
                    "awsvpcConfiguration": {
                        "subnets": subnets,
                        "securityGroups": [security_group_id],
                        "assignPublicIp": "DISABLED",
                    }
                },
                loadBalancers=[
                    {"targetGroupArn": get_target_group_arn(), "containerName": ECS_NAME, "containerPort": 4040}
                ],
            )
            print("Service created successfully")
        else:
            # Service exists, so we update it
            print(f"Service {ECS_NAME} found, updating service")
            ecs_client.update_service(cluster=cluster_name, service=ECS_NAME, taskDefinition=task_definition)
            print("Service updated successfully")
    except ecs_client.exceptions.ClientException as e:
        raise Exception(f"Error in ECS service operation: {str(e)}")

def get_vpc_id(ec2_client):
    """
    Retrieve the VPC ID by the given VPC name.
    """
    try:
        vpcs = ec2_client.describe_vpcs(Filters=[{"Name": "tag:Name", "Values": [VPC_NAME]}])
        return vpcs["Vpcs"][0]["VpcId"]
    except Exception as e:
        raise Exception(f"Failed to retrieve VPC ID: {str(e)}")

def get_private_subnets(vpc_id, ec2_client):
    """
    Retrieve the private subnets for the given VPC ID.
    """
    try:
        subnets = ec2_client.describe_subnets(
            Filters=[{"Name": "vpc-id", "Values": [vpc_id]}, {"Name": "tag:Name", "Values": ["*private*"]}]
        )
        return [subnet["SubnetId"] for subnet in subnets["Subnets"]]
    except Exception as e:
        raise Exception(f"Failed to retrieve private subnets: {str(e)}")

def get_target_group_arn():
    """
    Get the ARN of the target group by name.
    """
    try:
        client = boto3.client("elbv2", region_name=REGION)
        response = client.describe_target_groups(Names=[TARGET_GROUP_NAME])
        return response["TargetGroups"][0]["TargetGroupArn"]

    except Exception as e:
        raise Exception(f"Error getting TargetGroup ARN: {str(e)}")

def get_security_group_id(ec2_client):
    """
    Retrieve the security group ID by its name.
    """
    try:
        security_groups = ec2_client.describe_security_groups(
            Filters=[{"Name": "group-name", "Values": [SECURITY_GROUP_NAME]}]
        )
        return security_groups["SecurityGroups"][0]["GroupId"]
    except Exception as e:
        raise Exception(f"Failed to retrieve security group ID: {str(e)}")


if __name__ == "__main__":
    ecs_client = boto3.client("ecs", region_name=REGION)
    ec2_client = boto3.client("ec2", region_name=REGION)

    try:
        task_definition_arn = register_task_definition(ecs_client)
        update_ecs_service(task_definition=task_definition_arn, ecs_client=ecs_client, ec2_client=ec2_client)
        print("Deployment complete!")
    except Exception as e:
        print(f"Deployment failed: {str(e)}")
        raise e

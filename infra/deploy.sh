#!/bin/bash
set -euo pipefail

ASG_NAME="${ENV_ASG_NAME}-gha-${BUILD_NUMBER}"
declare -i MIN_SIZE=${ENV_MIN_SIZE:-1}
declare -i MAX_SIZE=${ENV_MAX_SIZE:-1}
declare -i DESIRED_CAP=${ENV_DESIRED_CAP:-1}
declare -i ASG_HEALTH_CHECK_GRACE_PERIOD=${ENV_ASG_HEALTH_CHECK_GRACE_PERIOD:-1200}
declare -i ASG_INITIALIZATION_DELAY=60
declare -i ATTEMPTS=${ENV_ATTEMPTS:-36}
declare -i ASG_DESTROY_DELAY=30

# Split ENV_TG into an array
IFS=' ' read -r -a TG_ARRAY <<< "$ENV_TG"

# Launch Autoscaling Group from Launch Template
echo "Creating new Autoscaling Group: $ASG_NAME from Launch Template: $ENV_LT_NAME:$ENV_LT_VERSION"
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name "$ASG_NAME" \
    --launch-template "LaunchTemplateName=${ENV_LT_NAME},Version=${ENV_LT_VERSION}" \
    --min-size $MIN_SIZE \
    --max-size $MAX_SIZE \
    --desired-capacity $DESIRED_CAP \
    --tags "Key=Environment,Value=${ENVIRONMENT}" "Key=Role,Value=${ENV_INSTANCE_TYPE}" "Key=Namespace,Value=pfda" "Key=Name,Value=pfda-${ENVIRONMENT}-${ENV_INSTANCE_TYPE}-vm" \
    --vpc-zone-identifier "$ENV_SUBNET1","$ENV_SUBNET2","$ENV_SUBNET3" \
    --target-group-arns "${TG_ARRAY[@]}" \
    --health-check-type "ELB" \
    --health-check-grace-period $ASG_HEALTH_CHECK_GRACE_PERIOD

# Wait for Autoscaling Group initialization
echo "Sleep $ASG_INITIALIZATION_DELAY seconds to wait for Autoscaling Group initialization"
sleep $ASG_INITIALIZATION_DELAY

# Wait for instances to become healthy
TIMEOUT=$((ATTEMPTS / 2))
echo "Waiting for instances to become healthy (minimum: $MIN_SIZE, desired: $DESIRED_CAP, maximum: $MAX_SIZE, timeout: $TIMEOUT minutes)"

i=0
status="unhealthy"
while [ "$status" = "unhealthy" ] && [ $i -lt $ATTEMPTS ]; do
    sleep 30
    status_check="healthy"
    instance_ids=$(aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names "$ASG_NAME" --query AutoScalingGroups[].Instances[].InstanceId --output text)
    for instance_id in $instance_ids; do
        for tg_arn in "${TG_ARRAY[@]}"; do
            instance_status=$(aws elbv2 describe-target-health --target-group-arn "$tg_arn" --targets "Id=$instance_id" --query "TargetHealthDescriptions[].TargetHealth.State" --output text)
            if [ "$instance_status" != "healthy" ]; then
                status_check="unhealthy"
                break 2 # Break out of both loops
            fi
        done
    done
    echo " - $status_check"
    status="$status_check"
    i=$((i + 1))
done

# If instances did not reach a healthy state, remove the new Auto Scaling Group
if [ "$status" = "unhealthy" ]; then
    echo "Instances did not reach a healthy state, removing new Auto Scaling Group: $ASG_NAME"
    aws autoscaling delete-auto-scaling-group --auto-scaling-group-name "$ASG_NAME" --force-delete
    exit 1
fi

# Instances reached a healthy state, detach old Auto Scaling Group(s)
echo "Instances reached healthy state, detaching old Auto Scaling Group(s)"

if [ "$ENV_INSTANCE_TYPE" == "gsrsinstance" ]; then
    echo "Executing specific GSRS instance commands"

    INSTANCE_IDS=$(aws autoscaling describe-auto-scaling-groups \
        --auto-scaling-group-names "$ASG_NAME" \
        --query "AutoScalingGroups[].Instances[].InstanceId" \
        --output text | xargs | tr " " ",")

    if [ -z "$INSTANCE_IDS" ]; then
        echo "Warning: No instances found in ASG $ASG_NAME. Skipping SSM command."
    else
        echo "Sending SSM command to instances: $INSTANCE_IDS"
        
        aws ssm send-command \
            --document-name "RunGsrsExport" \
            --targets Key=instanceids,Values=${INSTANCE_IDS} \
            --comment "Trigger GSRS export script" \
            --region us-east-1

        echo "SSM command successfully triggered."
    fi
fi

asg_to_destroy=""
asg_names=$(aws autoscaling describe-auto-scaling-groups --query AutoScalingGroups[].AutoScalingGroupName --output text)
for asg_name in $asg_names; do
    lbtg=$(aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names "$asg_name" --query AutoScalingGroups[].TargetGroupARNs[0] --output text)
    if [ ! "$lbtg" ]; then
        lbtg="undef"
    fi
    for tg_arn in "${TG_ARRAY[@]}"; do
        if [[ "$lbtg" == *"$tg_arn"* ]] && [ "$asg_name" != "$ASG_NAME" ]; then
            aws autoscaling detach-load-balancer-target-groups --auto-scaling-group-name "$asg_name" --target-group-arns "$tg_arn"
            asg_to_destroy="$asg_to_destroy$asg_name "
        fi
    done
done

# Destroy old Auto Scaling Groups
echo "Sleep $ASG_DESTROY_DELAY seconds to make sure detachment is completed before old Autoscaling Group(s) get destroyed"
sleep $ASG_DESTROY_DELAY
for asg_name in $asg_to_destroy; do
    echo "Destroying old Auto Scaling Group: $asg_name"
    aws autoscaling delete-auto-scaling-group --auto-scaling-group-name "$asg_name" --force-delete
done
echo "Deployment completed SUCCESSFULLY!"

#!/bin/bash

aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name "${ENV_ASG_NAME}-gha-${BUILD_NUMBER}" \
    --launch-template "LaunchTemplateName=${ENV_LT_NAME},Version=${ENV_LT_VERSION}" \
    --min-size "$ENV_MIN_SIZE" \
    --max-size "$ENV_MAX_SIZE" \
    --desired-capacity "$ENV_DESIRED_CAP" \
    --tags "Key=Environment,Value=${ENVIRONMENT}" "Key=Role,Value=appinstance" "Key=Namespace,Value=pfda" "Key=Name,Value=pfda-${ENVIRONMENT}-appinstance-vm" \
    --vpc-zone-identifier "$ENV_SUBNET1","$ENV_SUBNET2","$ENV_SUBNET3" \
    --target-group-arns "$ENV_TG" \
    --health-check-type "ELB" \
    --health-check-grace-period 1200

sleep 120
status="unhealthy"
i=0
while [ "$status" = "unhealthy" ] && [ "$i" -lt 120 ]; do
    sleep 20
    status_check="healthy"
    for ID in $(aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names "${ENV_ASG_NAME}-gha-${BUILD_NUMBER}" --query AutoScalingGroups[].Instances[].InstanceId --output text); do
        id_status=$(aws elbv2 describe-target-health --target-group-arn "$ENV_TG" --targets "Id=$ID" --query "TargetHealthDescriptions[].TargetHealth.State" --output text)
        if [ "$id_status" != "healthy" ]; then
            status_check="unhealthy"
        fi
    done
    echo "$status_check"
    status="$status_check"
    i=$((i + 1))
done

if [ "$status" = "unhealthy" ]; then
    echo "Instances did not reach a healthy state. Removing auto-scaling group"
    aws autoscaling delete-auto-scaling-group --auto-scaling-group-name "${ENV_ASG_NAME}-gha-${BUILD_NUMBER}" --force-delete
    exit 1
else
    echo "Reached healthy state"
fi

echo "Detaching old auto-scaling group"
asg_to_destroy=""
for asgname in $(aws autoscaling describe-auto-scaling-groups --query AutoScalingGroups[].AutoScalingGroupName --output text); do
    lbtg=$(aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names "$asgname" --query AutoScalingGroups[].TargetGroupARNs[0] --output text)
    if [ ! "$lbtg" ]; then
        lbtg="undef"
    fi
    if [ "$lbtg" = "$ENV_TG" ] && [ "$asgname" != "${ENV_ASG_NAME}-gha-${BUILD_NUMBER}" ]; then
        aws autoscaling detach-load-balancer-target-groups --auto-scaling-group-name "$asgname" --target-group-arns "$ENV_TG"
        asg_to_destroy="$asg_to_destroy$asgname "
    fi
done

echo "$asg_to_destroy will be destroyed"

sleep "$ASG_DESTROY_DELAY"

echo "Destroying $asg_to_destroy"
for asgname in $asg_to_destroy; do
    aws autoscaling delete-auto-scaling-group --auto-scaling-group-name "$asgname" --force-delete
done

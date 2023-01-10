# This is a functional eqivalent of the following file from the opscode rep:
#   cookbooks/dnanexus/recipes/qualys_agent.rb
#
# Prerequisites
#
# 1.  Copy qualys-keys.csv to s3://dnanexus-assets/qualys/keys/
# 2.  Copy QualysCloudAgent.deb to s3://dnanexus-assets/qualys/5.0.2.4/

bash "install qualys-cloud-agent" do
  user "root"
  code lazy {
    <<~EOH
      export AWS_ACCESS_KEY_ID=#{node.run_state["ssm_params"]["qualys"]["aws_access_key_id"]}
      export AWS_SECRET_ACCESS_KEY=#{node.run_state["ssm_params"]["qualys"]["aws_secret_access_key"]}
      export QUALYS_VERSION=#{node.run_state["ssm_params"]["qualys"]["version"] || "5.0.2.4"}
      export AWS_DEFAULT_REGION="us-east-1"

      BUCKET="s3://dnanexus-assets"

      aws s3 cp ${BUCKET}/qualys/keys/qualys-keys.csv /tmp
      aws s3 cp ${BUCKET}/qualys/${QUALYS_VERSION}/QualysCloudAgent.deb /tmp

      while fuser /var/lib/dpkg/lock >/dev/null 2>&1; do
        echo "apt already running, waiting ..."
        sleep 45
      done
      apt-get install -y --allow-downgrades /tmp/QualysCloudAgent.deb
    EOH
  }
  only_if { node.run_state["ssm_params"]["qualys"] }
end

bash "activate qualys-cloud-agent" do
  user "root"
  code lazy {
    <<~EOH
      export ENVIRONMENT=#{node.run_state["ssm_params"]["qualys"]["environment"] || "DEV"}
      export CUSTOMER_ID=#{node.run_state["ssm_params"]["qualys"]["customer_id"] || "b3603eda-07a6-a94c-e040-10ac13043746"}
      export ACTIVATION_ID=`awk -F,  '/^'$ENVIRONMENT',/ {print $2}' /tmp/qualys-keys.csv`

      if [ -z "$ACTIVATION_ID" ] ; then
          echo "No activation key for environment $ENVIRONMENT"
          exit 1
      fi

      /usr/local/qualys/cloud-agent/bin/qualys-cloud-agent.sh \
        CustomerId=$CUSTOMER_ID \
        ActivationId=$ACTIVATION_ID
    EOH
  }
  only_if { node.run_state["ssm_params"]["qualys"] }
end

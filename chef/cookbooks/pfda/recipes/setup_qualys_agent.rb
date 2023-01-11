# This is a functional eqivalent of the following file from the opscode rep:
#   cookbooks/dnanexus/recipes/qualys_agent.rb
#
# Prerequisites
#
# 1.  Copy qualys-keys.csv to s3://dnanexus-assets/qualys/keys/
# 2.  Copy QualysCloudAgent.deb to s3://dnanexus-assets/qualys/{version}/

bash "install qualys-cloud-agent" do
  user "root"
  code lazy {
    <<~EOH
      export QUALYS_VERSION=#{node.run_state["ssm_params"]["qualys"]["version"] || "5.0.2.4"}
      export AWS_ACCESS_KEY_ID=#{node.run_state["ssm_params"]["qualys"]["aws_access_key_id"]}
      export AWS_SECRET_ACCESS_KEY=#{node.run_state["ssm_params"]["qualys"]["aws_secret_access_key"]}
      export AWS_DEFAULT_REGION="us-east-1"

      aws s3 cp s3://dnanexus-assets/qualys/${QUALYS_VERSION}/QualysCloudAgent.deb /tmp

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
      export CUSTOMER_ID=#{node.run_state["ssm_params"]["qualys"]["customer_id"] || "b3603eda-07a6-a94c-e040-10ac13043746"}
      export ACTIVATION_ID=#{node.run_state["ssm_params"]["qualys"]["activation_id"]}

      /usr/local/qualys/cloud-agent/bin/qualys-cloud-agent.sh \
        CustomerId="$CUSTOMER_ID" \
        ActivationId="$ACTIVATION_ID"
    EOH
  }
  only_if { node.run_state["ssm_params"]["qualys"] }
end

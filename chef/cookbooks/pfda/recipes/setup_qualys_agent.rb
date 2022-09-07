# This is a functional eqivalent of the following file from the opscode rep:
#   cookbooks/dnanexus/recipes/qualys_agent.rb
#
# Prerequisites
#
# 1.  Copy qualys-keys.csv to s3://dnanexus-assets/qualys/keys/
# 2.  Copy qualys-cloud-agent.x86_64.deb to s3://dnanexus-assets/qualys/1.6.1/

bash "install qualys-cloud-agent" do
  user "root"
  code lazy {
    <<~EOH
      export AWS_ACCESS_KEY_ID=#{node.run_state["ssm_params"]["qualys"]["aws_access_key_id"]}
      export AWS_SECRET_ACCESS_KEY=#{node.run_state["ssm_params"]["qualys"]["aws_secret_access_key"]}
      export AWS_DEFAULT_REGION="us-east-1"

      BUCKET="s3://dnanexus-assets"

      aws s3 cp ${BUCKET}/qualys/keys/qualys-keys.csv /tmp
      aws s3 cp ${BUCKET}/qualys/1.6.1/qualys-cloud-agent.x86_64.deb /tmp

      while fuser /var/lib/dpkg/lock >/dev/null 2>&1; do
        echo "apt already running, waiting ..."
        sleep 45
      done
      apt-get install -y --allow-downgrades /tmp/qualys-cloud-agent.x86_64.deb
    EOH
  }
  only_if { node.run_state["ssm_params"]["qualys"] }
end

bash "activate qualys-cloud-agent" do
  user "root"
  code lazy {
    <<~EOH
      environment=#{node.run_state["ssm_params"]["qualys"]["environment"]}

      customerID="b3603eda-07a6-a94c-e040-10ac13043746"
      activationID=`awk -F,  '/^'$environment',/ {print $2}' /tmp/qualys-keys.csv`

      if [ -z "$activationID" ] ; then
          echo "No activation key for environment $environment"
          exit 1
      fi

      /usr/local/qualys/cloud-agent/bin/qualys-cloud-agent.sh \
        CustomerId=$customerID \
        ActivationId=$activationID
    EOH
  }
  only_if { node.run_state["ssm_params"]["qualys"] }
end

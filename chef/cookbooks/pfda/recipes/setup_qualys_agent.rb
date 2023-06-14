# This is a functional eqivalent of the following file from the opscode rep:
#   cookbooks/dnanexus/recipes/qualys_agent.rb
#
# Prerequisites
#
# 1.  Copy qualys-keys.csv to s3://dnanexus-assets/qualys/keys/
# 2.  Copy QualysCloudAgent.deb to s3://dnanexus-assets/qualys/{version}/

bash "copy_qualys_cloud_agent" do
  code lazy {
    <<~EOH
      export AWS_ACCESS_KEY_ID=#{node.run_state["ssm_params"]["qualys"]["aws_access_key_id"]}
      export AWS_SECRET_ACCESS_KEY=#{node.run_state["ssm_params"]["qualys"]["aws_secret_access_key"]}
      export AWS_DEFAULT_REGION="us-east-1"
      export QUALYS_VERSION=#{node.run_state.dig("ssm_params", "qualys", "version") || node.default[:qualys][:version]}
      export DESTINATION_DIR=#{Chef::Config[:file_cache_path]}/qualys/${QUALYS_VERSION}/
      mkdir -p ${DESTINATION_DIR}
      aws s3 cp s3://dnanexus-assets/qualys/${QUALYS_VERSION}/QualysCloudAgent.deb ${DESTINATION_DIR}
    EOH
  }
  creates lazy {"#{Chef::Config[:file_cache_path]}/qualys/#{node.run_state.dig("ssm_params", "qualys", "version") || node.default[:qualys][:version]}/QualysCloudAgent.deb"}
  only_if { node.run_state["ssm_params"]["qualys"] }
end

dpkg_package 'install_qualys_cloud_agent' do
  source lazy {"#{Chef::Config[:file_cache_path]}/qualys/#{node.run_state.dig("ssm_params", "qualys", "version") || node.default[:qualys][:version]}/QualysCloudAgent.deb"}
  options '--force-downgrade'
  action :install
  only_if { node.run_state["ssm_params"]["qualys"] }
end

bash "activate_qualys_cloud_agent" do
  user "root"
  code lazy {
    <<~EOH
      export CUSTOMER_ID=#{node.run_state["ssm_params"]["qualys"]["customer_id"]}
      export ACTIVATION_ID=#{node.run_state["ssm_params"]["qualys"]["activation_id"]}
      /usr/local/qualys/cloud-agent/bin/qualys-cloud-agent.sh \
        CustomerId="$CUSTOMER_ID" \
        ActivationId="$ACTIVATION_ID"
    EOH
  }
  only_if {node.run_state["ssm_params"]["qualys"] && node[:qualys][:activate]}
end
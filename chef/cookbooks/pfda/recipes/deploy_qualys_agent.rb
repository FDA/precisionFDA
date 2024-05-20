bash 'copy_qualys_cloud_agent' do
  code(lazy do
    <<~BASH
      export AWS_ACCESS_KEY_ID=#{node.run_state['ssm_params']['qualys']['aws_access_key_id']}
      export AWS_SECRET_ACCESS_KEY=#{node.run_state['ssm_params']['qualys']['aws_secret_access_key']}
      export AWS_DEFAULT_REGION="us-east-1"
      export QUALYS_VERSION=#{node.run_state.dig('ssm_params', 'qualys', 'version') || node.default[:qualys][:version]}
      export DESTINATION_DIR=#{Chef::Config[:file_cache_path]}/qualys/${QUALYS_VERSION}/
      mkdir -p ${DESTINATION_DIR}
      aws s3 cp s3://dnanexus-assets/qualys/${QUALYS_VERSION}/QualysCloudAgent.deb ${DESTINATION_DIR}
    BASH
  end)
  creates(lazy do
            "#{Chef::Config[:file_cache_path]}/qualys/#{node.run_state.dig('ssm_params', 'qualys', 'version') ||
            node.default[:qualys][:version]}/QualysCloudAgent.deb"
          end)
  only_if { node.run_state['ssm_params']['qualys'] }
end

dpkg_package 'install_qualys_cloud_agent' do
  source(lazy do
           "#{Chef::Config[:file_cache_path]}/qualys/#{node.run_state.dig('ssm_params', 'qualys', 'version') ||
            node.default[:qualys][:version]}/QualysCloudAgent.deb"
         end)
  options '--force-downgrade'
  action :install
  only_if { node.run_state['ssm_params']['qualys'] }
end

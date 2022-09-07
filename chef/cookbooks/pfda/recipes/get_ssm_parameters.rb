ruby_block 'get aws region' do
  block do
    node.run_state["aws_region"] =
      `curl -s http://169.254.169.254/latest/meta-data/placement/region`.strip
  end
end

aws_ssm_parameter_store "get all ssm parameters" do
  path "#{node[:ssm_base_path]}/"
  recursive true
  with_decryption true
  return_key "ssm_params"
  action :get_parameters_by_path
  region lazy { node.run_state["aws_region"] }
end

bash "activate_qualys_cloud_agent" do
  user "root"
  code(lazy do
    <<~BASH
      /usr/local/qualys/cloud-agent/bin/qualys-cloud-agent.sh CustomerId="$CUSTOMER_ID" ActivationId="$ACTIVATION_ID"
    BASH
  end)
  environment(lazy do
    {
      CUSTOMER_ID: node.run_state["ssm_params"]["qualys"]["customer_id"],
      ACTIVATION_ID: node.run_state["ssm_params"]["qualys"]["activation_id"],
    }
  end)
  only_if { node.run_state["ssm_params"]["qualys"] && node[:qualys][:activate] }
end

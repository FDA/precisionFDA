name "pfda_server"
description "The role for pFDA application server"
run_list "recipe[pfda::get_ssm_parameters]",
         "recipe[pfda::setup_nodejs]",
         "recipe[pfda::setup_qualys_agent]",
         "recipe[pfda::configure_nginx]",
         "recipe[pfda::configure_https_app]",
         "recipe[pfda::deploy_gsrs]",
         "recipe[pfda::deploy]"

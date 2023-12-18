name "pfda_server"
description "The role for pFDA application server"
run_list "recipe[pfda::get_ssm_parameters]",
         "recipe[pfda::configure_nginx]",
         "recipe[pfda::configure_https_app]",
         "recipe[pfda::configure_logrotate]",
         "recipe[pfda::deploy_qualys_agent]",
         "recipe[pfda::activate_qualys_agent]",
         "recipe[pfda::deploy_gsrs]",
         "recipe[pfda::deploy_ruby]",
         "recipe[pfda::start_ruby]",
         "recipe[pfda::deploy_https_app]",
         "recipe[pfda::start_https_app]"

name "gsrs_server"
description "The role for gsrs application server"
run_list "recipe[pfda::get_ssm_parameters]",
         "recipe[pfda::configure_nginx_gsrs]",
         "recipe[pfda::deploy_gsrs]"

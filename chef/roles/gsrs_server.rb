name "gsrs_server"
description "The role for gsrs application server"
run_list "recipe[pfda::get_ssm_parameters]",
         "recipe[pfda::deploy_gsrs]"
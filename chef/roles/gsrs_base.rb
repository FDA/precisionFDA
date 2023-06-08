name "gsrs_base"
description "The role for gsrs application base AMI"
run_list "recipe[pfda::get_ssm_parameters]",
         "recipe[pfda::deploy_gsrs]"
default_attributes "gsrs" => { "tomcat_start" => false }
# PrecisionFDA cookbook

## Requirements

https://downloads.chef.io/chefdk

## Local start
* copy `.kitchen.yml` to `.kitchen.local.yml`
* copy `data_bags/aws_opsworks_app_example/pfda_application.json` to `data_bags/aws_opsworks_app/pfda_application.json`
* modify data_bag(pfda_application.json):
  * add `RSA PRIVATE KEY`
* modify(optional) `.kitchen.yml`
* run 
    * `kitchen create`
    * `kitchen converge`

## Contributions

* clone project to a new path and checkout to the `cookbook` branch:
    * `git clone git@github.com:dnanexus/precision-fda.git /path_to/pfda_cookbook`
    * `cd /path_to/pfda_cookbook`
    * `git fetch origin`
    * `git checkout cookbook`

* after cookbook changes(`master` branch) run:
    * `cd /path_to/pfda_project`
    * `berks vendor /path_to/pfda_cookbook`
    * `cd /path_to/pfda_cookbook`
    * `git add .`
    * `git commit -m 'commit message'`
    * `git push origin cookbook`

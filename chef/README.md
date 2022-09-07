# PFDA Chef Recipes

Chef is the tool we use to deploy the pFDA server via AWS CodeBuild.
It downloads and configures nginx, the backend, frontend and uses configurations from both Parameter Store and CodeBuild environment.

# Testing Chef Recipes

1. Start an EC2 instance using the latest pfda_server AMI
2. Install Chef and SSH keys

  sudo su - root
  REGION=$(curl http://169.254.169.254/latest/meta-data/placement/region)
  curl -L https://omnitruck.chef.io/install.sh | sudo bash -s -- -v 16.12.3-1
  aws configure
  aws ssm get-parameter --name /pfda/dev/app/app_source/ssh_key --with-decryption --output text --query Parameter.Value --region $REGION  > /root/.ssh/id_rsa
  chmod 400 /root/.ssh/id_rsa

3. Clone precision-fda.git (if not testing with /srv/www/precision_fda/current)
4. Install Chef dependencies

  gem install berkshelf -N
  cd precision_fda/chef/cookbooks/pfda
  berks vendor ../

5. Run recipe(s) as described below

## Running the full pfda stack

  cd precision_fda/chef
  chef-client --chef-license accept-silent --no-fips -z -E dev -r "role[pfda_server]"

Note that `-E dev` sets the build environment. Change to staging or production as needed. For example to test the production build
you can run the following, but will need AWS credentials that has access to prod SSM

  chef-client --chef-license accept-silent --no-fips -z -E production -r "role[pfda_server]"

## Running specific recipes

Run a specific recipe to test it directly, but be sure to invoke `pfda::get_ssm_parameters` first before the other steps:

  chef-client --chef-license accept-silent --no-fips -z -E dev -r "recipe[pfda::get_ssm_parameters],recipe[pfda::deploy_ruby]"

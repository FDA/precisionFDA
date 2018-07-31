#
# This is a functional eqivalent of the following file from the opscode rep:
#
#  cookbooks/dnanexus/recipes/qualys_agent.rb
#
# Prerequisites
#
# 1.  Copy qualys-keys.csv to s3://dnanexus-assets/qualys/keys/
#
# 2.  Copy qualys-cloud-agent.x86_64.deb to s3://dnanexus-assets/qualys/1.6.1/
#
# To apply this on existing machines, do the following as root
#
# 1. Copy the following JSON into /tmp/recipe-qualys.json file (minus 
#    comments of course):
#
#      {
#        "run_list":["recipe[pfda_cookbook::qualys_agent]"],
#        "qualys":{
#          "aws_access_key_id": "<aws access key id>",
#          "aws_secret_access_key": "<aws secret access key>",
#          "environment": "<environment>"
#        }
#      }
#
#    Where:
#      <aws access key id> - An access key that has read permissions to
#        s3://dnanexus-assets
#
#      <aws secret access key> - The secret key for  <aws access key id>
#
#      <environment> is one of the following:
#        PROD
#        STG
# 
# 2. Create the /tmp/solo.rb config file that specifies the cookbook path for
#    this recipe.  For example:
#
#      cookbook_path "/dnanexus/precision-fda"
#
# 3. Run the following command to update the host:
#
#    sudo chef-solo -c /tmp/solo.rb -j /tmp/recipe-qualys.json
#
#    Where <config file> points to a config file that points at 
#    the cook location (e.g. /dnanexus/precision-fda/pfda_cookbook)
#


aws_access_key_id = node[:qualys][:aws_access_key_id]
aws_secret_access_key = node[:qualys][:aws_secret_access_key]
environment = node[:qualys][:environment]


bash "install qualys-cloud-agent" do
  user "root"
  code <<-EOH
    export AWS_ACCESS_KEY_ID=#{aws_access_key_id}
    export AWS_SECRET_ACCESS_KEY=#{aws_secret_access_key}
    export AWS_DEFAULT_REGION="us-east-1"

    BUCKET="s3://dnanexus-assets"

    aws s3 cp ${BUCKET}/qualys/keys/qualys-keys.csv /tmp
    aws s3 cp ${BUCKET}/qualys/1.6.1/qualys-cloud-agent.x86_64.deb /tmp

    dpkg --install /tmp/qualys-cloud-agent.x86_64.deb
  EOH
end


bash "activate qualys-cloud-agent" do
  user "root"
  code <<-EOH

    environment=#{environment}

    customerID="b3603eda-07a6-a94c-e040-10ac13043746"
    activationID=`awk -F,  '/^'$environment',/ {print $2}' /tmp/qualys-keys.csv`

    if [ -z "$activationID" ] ; then
        echo "No activation key for environment $environment"
        exit 1
    fi

    /usr/local/qualys/cloud-agent/bin/qualys-cloud-agent.sh \
      CustomerId=$customerID \
      ActivationId=$activationID

  EOH
end

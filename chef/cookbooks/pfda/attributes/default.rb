deploy_user = "deploy"

default[:ssm_base_path] = "/pfda/#{node.environment}"

default[:app][:enable_ssl] = true
default[:app][:shortname] = "precision_fda"

default[:gsrs][:port] = 9000
default[:gsrs][:app_dir] = "/home/#{deploy_user}/gsrs"
default[:gsrs][:repo_url] = "https://github.com/dnanexus/gsrs-play-dist.git"
default[:gsrs][:revision] = "precisionFDA_PROD"
default[:gsrs][:indexes_bucket] = "gsrs-indexes-#{node.environment}"

default[:deploy_user] = deploy_user
default[:deploy_user_group] = deploy_user

default[:ssh_key_path] = "/home/#{deploy_user}/.ssh/id_rsa"
default[:ssh_wrapper_path] = "/tmp/wrap-ssh4git.sh"

default[:rails_app_dir] = "/srv/www/precision_fda/current"
default[:mysql_rds_sslca_path] = "/etc/ssl/certs/rds-combined-ca-bundle.pem"
default[:nginx][:log_dir] = "/var/log/nginx"

default[:logrotate][:rotate] = 30
default[:logrotate][:dateformat] = false # set to '-%Y%m%d' to have date formatted logs

nodejs_version = "16.15.0"
default["nodejs"]["install_method"] = "binary"
default["nodejs"]["version"] = nodejs_version

# The location to install global items.
default["nodejs"]["prefix"] = "/usr/local/nodejs-binary-#{nodejs_version}"

# https://nodejs.org/dist/v16.15.0/SHASUMS256.txt
default["nodejs"]["binary"]["checksum"] =
  "0c9fac94a37ff9f59bad86c86a8660309978a0106785b5e99440e97caef44fd4"

default["nodejs"]["bin_path"] = "/usr/local/nodejs-binary/bin/"
default["nodejs"]["worker"]["instances"] = 2

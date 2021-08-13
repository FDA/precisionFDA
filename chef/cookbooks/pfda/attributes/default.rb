default[:ssm_base_path] = "/pfda/#{node.environment}"

default[:aws_region] = "us-west-2"
default[:app][:enable_ssl] = true
default[:app][:shortname] = "precision_fda"

default[:gsrs_app_dir] = "/home/deploy/gsrs"

default[:deploy_user] = "deploy"
default[:deploy_user_group] = "deploy"

default[:rails_app_dir] = "/srv/www/precision_fda/current"
default[:mysql_rds_sslca_path] = "/etc/ssl/certs/rds-combined-ca-bundle.pem"
default[:nginx][:log_dir] = "/var/log/nginx"

default[:logrotate][:rotate] = 30
default[:logrotate][:dateformat] = false # set to '-%Y%m%d' to have date formatted logs

nodejs_version = "12.16.1"
default["nodejs"]["install_method"] = "binary"
default["nodejs"]["version"] = nodejs_version

# The location to install global items.
default["nodejs"]["prefix"] = "/usr/local/nodejs-binary-#{nodejs_version}"

# https://nodejs.org/dist/v12.16.1/SHASUMS256.txt
default["nodejs"]["binary"]["checksum"] =
  "b2d9787da97d6c0d5cbf24c69fdbbf376b19089f921432c5a61aa323bc070bea"

default["nodejs"]["bin_path"] = "/usr/local/nodejs-binary/bin/"

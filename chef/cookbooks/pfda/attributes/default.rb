deploy_user = "deploy"

default[:ssm_base_path] = "/pfda/#{node.environment}"

default[:app][:enable_ssl] = true
default[:app][:shortname] = "precision_fda"

default[:gsrs][:packages] = ["openjdk-11-jdk"]
default[:gsrs][:tomcat_path] = "/opt/gsrs"
default[:gsrs][:tomcat_version] = "10.0.8"
default[:gsrs][:tomcat_user] = "gsrs"
default[:gsrs][:tomcat_group] = "gsrs"
default[:gsrs][:index_path] = "s3://gsrs-indexes-#{node.environment}/ginas.ix/"
default[:gsrs][:repo_url] = "https://github.com/dnanexus/gsrs-play-dist.git"
default[:gsrs][:revision] = "gsrs_PROD"
default[:gsrs][:tomcat_start] = true
default[:gsrs][:catalina_opts] = "-Xms4G -Xmx12G"

default[:deploy_user] = deploy_user
default[:deploy_user_group] = deploy_user

default[:ssh_key_path] = "/home/#{deploy_user}/.ssh/id_rsa"
default[:ssh_wrapper_path] = "/tmp/wrap-ssh4git.sh"

default[:rails_app_dir] = "/srv/www/precision_fda/current"
default[:mysql_rds_sslca_path] = "/etc/ssl/certs/global-bundle.pem"
default[:nginx][:log_dir] = "/var/log/nginx"

default["nodejs"]["version"] = "18.9.1"
default["nodejs"]["install_method"] = "binary"
default["nodejs"]["binary"]["checksum"] = "33ecf5f39618f4beb90a9be98880325cb4f06e33b52e315040a54fd0700f2434" # https://nodejs.org/dist/v18.9.1/SHASUMS256.txt (node-v18.9.1-linux-x64.tar.gz)
default["nodejs"]["prefix"] = "/usr/local/nodejs-binary-#{default["nodejs"]["version"]}" # The location to install global items.
default["nodejs"]["bin_path"] = "/usr/local/nodejs-binary/bin/"
default["nodejs"]["worker"]["instances"] = 2

default[:logrotate][:period] = "daily"
default[:logrotate][:retention] = 30

default["qualys"]["version"] = "5.0.2.4"
default["qualys"]["activate"] = true

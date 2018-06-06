default['ruby_version'] = '2.2.3'
default['nginx_version'] = '1.13.12'
default['fips_version'] = '2.0.16'
default['openssl_version'] = '1.0.2n'
default['deploy_user'] = 'deploy'
default['deploy_user_group'] = 'deploy'

default['rails_app_dir'] = '/srv/www/precision_fda/current'
default['mysql_rds_sslca_path'] = '/etc/ssl/certs/rds-combined-ca-bundle.pem'
default['nginx']['log_dir'] = '/var/log/nginx'

default[:logrotate][:rotate] = 30
default[:logrotate][:dateformat] = false # set to '-%Y%m%d' to have date formatted logs

default['aide']['custom_rules']  = ["NORMAL = p+u+g+s+md5","/etc NORMAL", "/bin NORMAL", "/lib NORMAL", "/usr NORMAL", "/opt NORMAL", "/srv/www/precision_fda/current NORMAL",
                                    "/sbin NORMAL","/root NORMAL","!/var", "!/tmp", "!/home", "!/root/.viminfo"]
default['aide']['mail_to']       = "security.monitor@dnanexus.com,knafissi@dnanexus.com"
default['aide']['copy_new_db']   = "yes"
default['aide']['quiet_reports'] = "yes"
default['aide']['fqdn'] = `hostname`

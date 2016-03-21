default['aide']['custom_rules']  = ["NORMAL = p+u+g+s+md5","/etc NORMAL", "/bin NORMAL", "/lib NORMAL", "/usr NORMAL", "/opt NORMAL", "/srv/www/precision_fda/current NORMAL",
          "/sbin NORMAL","/root NORMAL","!/var", "!/tmp", "!/home", "!/root/.viminfo"]
default['aide']['mail_to']       = "security.monitor@dnanexus.com,knafissi@dnanexus.com"
default['aide']['copy_new_db']   = "yes"
default['aide']['quiet_reports'] = "yes"
default['aide']['fqdn'] = `hostname`

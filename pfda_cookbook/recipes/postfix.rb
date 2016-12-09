# Recipe: postfix

bash 'install_postfix' do
  user "root"
  code <<-EOH
    set -e
    export DEBIAN_FRONTEND=noninteractive
    apt-get install -y postfix
    # set postfix to only listen to loopback interface, connections can only originate from own host
    if [ -e /etc/postfix/main.cf ]; then
      sed -i 's/inet_interfaces = all/inet_interfaces = loopback-only/' /etc/postfix/main.cf
      service postfix restart
    fi
  EOH
end

# Recipe: postfix

bash 'install_postfix' do
  user "root"
  code <<-EOH
    set -e
    export DEBIAN_FRONTEND=noninteractive
    apt-get install -y postfix
  EOH
end

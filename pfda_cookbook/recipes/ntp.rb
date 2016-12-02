# Recipe: ntp
# Installs ntp and sets ntp server to NIST server

package "ntp" do
  action :install
end

template "/etc/ntp.conf" do
  source "ntp.conf.erb"
 # Use server from NIST, FedRAMP requirement to use time.nist.gov
  variables( :ntp_server => "time.nist.gov" )
end

service "ntp" do
  action :restart
end

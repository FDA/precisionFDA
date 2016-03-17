#
# Cookbook Name:: chef-aide
# Recipe:: default
#
# Copyright 2012, Morgan Nelson
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#

package "aide-xen"

cookbook_file "/etc/aide/aide.conf.d/99_aide_sysstat" do
  source "99_aide_sysstat"
  owner "root"
  group "root"
end

template "/etc/default/aide" do
  owner "root"
  group "root"
  source "aide-default.erb"
  variables(
    :mail_to           => node['aide']['mail_to'],
    :copy_new_db       => node['aide']['copy_new_db'],
    :quiet_reports     => node['aide']['quiet_reports'],
    :fqdn	       => node['aide']['fqdn'],
  )
end

template "/etc/aide/aide.conf.d/99_aide_custom" do
  owner "root"
  group "root"
  source "99_aide_custom.erb"
  variables(
    :custom_rules       => node['aide']['custom_rules'],
  )
  notifies :run, "execute[update-aide-config]", :immediately
end

file "/etc/aide/aide.conf.d/99_aide_root" do
  action :delete
end

execute "/usr/sbin/aideinit" do
	user "root"
	group "root"
	creates "/var/lib/aide/aide.db"
end

execute "update-aide-config" do
  command "/usr/sbin/update-aide.conf"
  user "root"
  group "root"
  action :nothing
end

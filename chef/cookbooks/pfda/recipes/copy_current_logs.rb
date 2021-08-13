template "/tmp/copy_current_logs.sh" do
  backup false
  source "copy_current_logs.sh.erb"
  mode "0755"
end

execute "copy current logs" do
  command "sh /tmp/copy_current_logs.sh"
end

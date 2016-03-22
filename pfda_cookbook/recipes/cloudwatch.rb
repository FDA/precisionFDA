# Recipe: cloudwatch
 
bash 'cloudwatch_monitor' do
  user "root"
  code <<-EOH
    set -e
    apt-get update
    apt-get install unzip
    apt-get install -y libwww-perl libdatetime-perl
    cd /opt/
    wget http://aws-cloudwatch.s3.amazonaws.com/downloads/CloudWatchMonitoringScripts-1.2.1.zip
    unzip CloudWatchMonitoringScripts-1.2.1.zip
    rm CloudWatchMonitoringScripts-1.2.1.zip
    cd aws-scripts-mon
    cp awscreds.template awscreds.conf
    echo "AWSAccessKeyId=#{node[:cloudwatch][:aws_access_key_id]}" >> awscreds.conf
    echo "AWSSecretKey=#{node[:cloudwatch][:aws_secret_access_key]}" >> awscreds.conf
    echo "*/5 * * * * root /opt/aws-scripts-mon/mon-put-instance-data.pl --disk-space-avail --disk-path=/ --from-cron" > /etc/cron.d/cloudwatch-monitor
    chmod +x /etc/cron.d/cloudwatch-monitor
    /etc/init.d/cron restart
  EOH
end

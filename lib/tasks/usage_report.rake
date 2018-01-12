namespace :usage_report do
  desc "Truncates and fills usage_metrics table"
  task generate: :environment do
    UsageCollector.call
  end
end

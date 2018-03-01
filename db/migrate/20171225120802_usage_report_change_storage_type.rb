class UsageReportChangeStorageType < ActiveRecord::Migration
  def change
    change_column :usage_metrics, :storage_usage, :bigint
  end
end

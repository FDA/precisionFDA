class UsageReportChangeStorageType < ActiveRecord::Migration[4.2]
  def change
    change_column :usage_metrics, :storage_usage, :bigint
  end
end

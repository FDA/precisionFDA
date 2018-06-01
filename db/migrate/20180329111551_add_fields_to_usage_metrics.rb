class AddFieldsToUsageMetrics < ActiveRecord::Migration
  def change
    create_table :settings do |t|
      t.string :key, null: false
      t.string :value, null: false
    end

    add_column :usage_metrics, :daily_byte_hours, :bigint
    add_column :usage_metrics, :weekly_byte_hours, :bigint
    add_column :usage_metrics, :monthly_byte_hours, :bigint
    add_column :usage_metrics, :yearly_byte_hours, :bigint
    add_column :usage_metrics, :custom_range_byte_hours, :bigint
    add_column :usage_metrics, :custom_range_compute_price, :decimal, precision: 30, scale: 20
  end
end

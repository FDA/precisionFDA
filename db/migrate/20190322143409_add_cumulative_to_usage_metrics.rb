class AddCumulativeToUsageMetrics < ActiveRecord::Migration[4.2]
  def change
    add_column :usage_metrics, :cumulative_compute_price, :decimal, precision: 30, scale: 20
    add_column :usage_metrics, :cumulative_byte_hours, :integer, limit: 8
  end
end

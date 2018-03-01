class UsageMetrics < ActiveRecord::Migration
  def change

    create_table :usage_metrics do |t|
      t.integer :user_id, null: false
      t.integer :storage_usage
      t.decimal :daily_compute_price, precision: 30, scale: 20
      t.decimal :weekly_compute_price, precision: 30, scale: 20
      t.decimal :monthly_compute_price, precision: 30, scale: 20
      t.decimal :yearly_compute_price, precision: 30, scale: 20
      t.timestamp :created_at
    end

  end
end

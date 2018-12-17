class AddVerifiedFieldToAppSeries < ActiveRecord::Migration
  def change
    add_column :app_series, :verified, :boolean, default: false, null: false
  end
end

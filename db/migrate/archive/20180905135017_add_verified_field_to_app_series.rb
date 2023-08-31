class AddVerifiedFieldToAppSeries < ActiveRecord::Migration[4.2]
  def change
    add_column :app_series, :verified, :boolean, default: false, null: false
  end
end

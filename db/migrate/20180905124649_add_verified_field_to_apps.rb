class AddVerifiedFieldToApps < ActiveRecord::Migration
  def change
    add_column :apps, :verified, :boolean, default: false, null: false
  end
end

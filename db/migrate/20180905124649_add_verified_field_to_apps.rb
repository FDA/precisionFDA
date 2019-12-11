class AddVerifiedFieldToApps < ActiveRecord::Migration[4.2]
  def change
    add_column :apps, :verified, :boolean, default: false, null: false
  end
end

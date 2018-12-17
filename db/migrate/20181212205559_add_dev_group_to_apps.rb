class AddDevGroupToApps < ActiveRecord::Migration
  def change
    add_column :apps, :dev_group, :string
  end
end

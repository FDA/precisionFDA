class AddDevGroupToApps < ActiveRecord::Migration[4.2]
  def change
    add_column :apps, :dev_group, :string
  end
end

class AddMetaToNotifications < ActiveRecord::Migration[6.1]
  def change
    add_column :notifications, :meta, :string, limit: 4096
  end
end

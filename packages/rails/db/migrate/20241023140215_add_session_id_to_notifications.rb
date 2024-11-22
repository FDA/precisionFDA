class AddSessionIdToNotifications < ActiveRecord::Migration[6.1]
  def change
    add_column :notifications, :session_id, :string
  end
end

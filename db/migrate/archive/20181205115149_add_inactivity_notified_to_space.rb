class AddInactivityNotifiedToSpace < ActiveRecord::Migration[4.2]
  def change
    add_column :spaces, :inactivity_notified, :boolean, default: false
  end
end

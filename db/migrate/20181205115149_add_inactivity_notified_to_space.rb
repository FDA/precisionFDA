class AddInactivityNotifiedToSpace < ActiveRecord::Migration
  def change
    add_column :spaces, :inactivity_notified, :boolean, default: false
  end
end

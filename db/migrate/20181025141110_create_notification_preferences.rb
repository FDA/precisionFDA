class CreateNotificationPreferences < ActiveRecord::Migration
  def change
    create_table :notification_preferences do |t|
      t.belongs_to :user, foreign_key: true, index: { unique: true }
      t.text :data
    end
  end
end

class FixDataInNotificationPreferences < ActiveRecord::Migration
  def change
    NotificationPreference.find_each do |item|
      item.update!(data: nil)
    end
  end
end

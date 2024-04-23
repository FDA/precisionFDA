class FixDataInNotificationPreferences < ActiveRecord::Migration[4.2]
  def change
    NotificationPreference.find_each do |item|
      item.update!(data: nil)
    end
  end
end

# == Schema Information
#
# Table name: sessions
#
#  id         :integer          not null, primary key
#  key        :string(255)      not null
#  user_id    :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Session < ApplicationRecord
  include Auditor

  validates :key, :user_id, presence: true

  def self.delete_expired
    where('updated_at < ?', MAX_MINUTES_INACTIVITY.minutes.ago).delete_all
  end

  def self.limit_reached?(user)
    session_count = where(user_id: user.id).count

    if !Rails.env.production? && user.dxuser == ENV["PFDA_TEST_USER"]
      session_count >= 100
    else
      session_count >= SESSIONS_LIMIT
    end
  end

  def expired?
    updated_at < MAX_MINUTES_INACTIVITY.minutes.ago
  end
end

class Session < ActiveRecord::Base
  include Auditor

  validates :key, :user_id, presence: true

  def self.delete_expired
    where('updated_at < ?', MAX_MINUTES_INACTIVITY.minutes.ago).delete_all
  end

  def self.limit_reached?(user)
    where(user_id: user.id).count >= SESSIONS_LIMIT
  end

  def expired?
    updated_at < MAX_MINUTES_INACTIVITY.minutes.ago
  end

end

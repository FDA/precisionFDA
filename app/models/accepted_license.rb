# == Schema Information
#
# Table name: accepted_licenses
#
#  id         :integer          not null, primary key
#  license_id :integer
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  state      :string(255)
#  message    :text(65535)
#

class AcceptedLicense < ApplicationRecord
  include Auditor

  STATUS_ACTIVE = "active".freeze
  STATUS_PENDING = "pending".freeze

  belongs_to :license
  belongs_to :user
  has_many :licensed_items, through: :license

  def pending?
    state == STATUS_PENDING
  end

  def active?
    state.nil? || state == STATUS_ACTIVE
  end

  class << self
    def pending
      where(state: STATUS_PENDING)
    end

    def active
      where(state: [nil, STATUS_ACTIVE])
    end
  end
end

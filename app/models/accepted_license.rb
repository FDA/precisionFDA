# == Schema Information
#
# Table name: accepted_licenses
#
#  id         :integer          not null, primary key
#  license_id :integer
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  state      :string
#  message    :text
#

class AcceptedLicense < ActiveRecord::Base
  include Auditor
  belongs_to :license
  belongs_to :user
  has_many :licensed_items, through: :license

  def pending?
    state == 'pending'
  end

  def active?
    state.nil? || state == 'active'
  end

  def self.pending
    where(state: 'pending')
  end

  def self.active
    where(state: [nil, 'active'])
  end
end

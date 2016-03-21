# == Schema Information
#
# Table name: accepted_licenses
#
#  id         :integer          not null, primary key
#  license_id :integer
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class AcceptedLicense < ActiveRecord::Base
  belongs_to :license
  belongs_to :user
  has_many :licensed_items, through: :license
end

# == Schema Information
#
# Table name: orgs
#
#  id         :integer          not null, primary key
#  handle     :string
#  name       :string
#  admin_id   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Org < ActiveRecord::Base
  has_many :users
  belongs_to :admin, {class_name: 'User'}
end

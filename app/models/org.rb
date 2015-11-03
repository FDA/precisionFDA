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
#  address    :text
#  duns       :string
#  phone      :string
#  state      :string
#  singular   :boolean
#

class Org < ActiveRecord::Base
  has_many :users
  belongs_to :admin, {class_name: 'User'}
end

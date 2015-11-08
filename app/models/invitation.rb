# == Schema Information
#
# Table name: invitations
#
#  id         :integer          not null, primary key
#  first_name :string
#  last_name  :string
#  email      :string
#  org        :string
#  singular   :boolean
#  address    :string
#  phone      :string
#  duns       :string
#  ip         :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Invitation < ActiveRecord::Base
  validates :first_name, :last_name, :email, :address, :phone, presence: true
  validates :singular, inclusion: [true, false]
  validates :org, presence: {message: "can't be blank unless you represent yourself"}, unless: :singular
end

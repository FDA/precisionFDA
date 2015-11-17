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
#  extras     :text
#

class Invitation < ActiveRecord::Base
  include Humanizer
  validates :first_name, :last_name, :email, :address, :phone, :req_reason, presence: true
  validates :singular, inclusion: [true, false]
  validates :org, presence: {message: "can't be blank unless you represent yourself"}, unless: :singular
  require_human_on :create

  store :extras, accessors: [ :req_reason, :req_data, :req_software, :research_intent, :clinical_intent ], coder: JSON
end

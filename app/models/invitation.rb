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
#  user_id    :integer
#  state      :string
#  code       :string
#

class Invitation < ActiveRecord::Base
  include Humanizer
  validates :first_name, :last_name, :email, :address, :phone, :req_reason, presence: true
  validates :singular, :research_intent, :clinical_intent, :participate_intent, :organize_intent, inclusion: [true, false]
  validates :org, presence: {message: "can't be blank unless you represent yourself"}, unless: :singular
  validate :valid_email, on: :create
  require_human_on :create
  belongs_to :user

  scope :guest, lambda { where(state: "guest") }

  store :extras, accessors: [ :req_reason, :req_data, :req_software, :research_intent, :clinical_intent, :consistency_challenge_intent, :truth_challenge_intent, :participate_intent, :organize_intent ], coder: JSON

  def valid_email
    if !User.validate_email(email)
      errors.add(:email, "is invalid")
    end
  end

  def expires_at
    [created_at, Time.zone.local(2015, 12, 15)].max + 30.days
  end

  def expired?
    expires_at <= Time.now
  end

  def org_handle
    org.downcase.gsub(/[^a-z]/, '')
  end
end

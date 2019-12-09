# == Schema Information
#
# Table name: invitations
#
#  id                 :integer          not null, primary key
#  first_name         :string(255)
#  last_name          :string(255)
#  email              :string(255)
#  org                :string(255)
#  singular           :boolean
#  phone              :string(255)
#  duns               :string(255)
#  ip                 :string(255)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  extras             :text(65535)
#  user_id            :integer
#  state              :string(255)
#  code               :string(255)
#  city               :string(255)
#  us_state           :string(255)
#  postal_code        :string(255)
#  address1           :string(255)
#  address2           :string(255)
#  organization_admin :boolean          default(FALSE), not null
#  country_id         :integer
#  phone_country_id   :integer
#

class Invitation < ApplicationRecord
  paginates_per 10

  include Auditor
  include Humanizer

  belongs_to :user
  belongs_to :country
  belongs_to :phone_country, class_name: 'Country'

  has_many :space_invitations, primary_key: :email, foreign_key: :email

  validates :first_name,
            :last_name,
            :email,
            :address1,
            :country,
            :city,
            :postal_code,
            :phone_country,
            :phone,
            :req_reason,
            presence: true

  validates :research_intent,
            :clinical_intent,
            :participate_intent,
            :organize_intent,
            inclusion: [true, false]

  validate :validate_email,
           :validate_phone,
           # :validate_state,
           :validate_phone_country_code,
           on: :create

  require_human_on :create, unless: -> { Rails.env.test? }

  store :extras,
        accessors: %i(
          req_reason
          req_data
          req_software
          research_intent
          clinical_intent
          consistency_challenge_intent
          truth_challenge_intent
          participate_intent
          organize_intent
        ),
        coder: JSON

  scope :guest, lambda { where(state: "guest") }
  scope :non_singular, -> { where(singular: false) }

  def expires_at
    [created_at, Time.zone.local(2015, 12, 15)].max + 30.days
  end

  def expired?
    expires_at <= Time.now
  end

  def org_handle
    org.downcase.gsub(/[^a-z]/, "")
  end

  def full_phone
    "#{phone_country_code}#{phone}"
  end

  def new_phone_format?
    phone && phone_country_id
  end

  private

  def phone_country_code
    phone_country.try(:dial_code)
  end

  def validate_phone_country_code
    if usa? && !usa_phone_code?
      errors.add(:phone_country_id, "doesn't match USA phone code")
    end
  end

  def validate_phone
    if full_phone.gsub(/[^0-9]/, '').length < 9
      errors.add(:phone, "wrong format")
    end
  end

  def usa_phone_code?
    phone_country_code == "+1"
  end

  def usa?
    country.name == "United States"
  end

  def validate_email
    if User.validate_email(email).nil?
      errors.add(:email, "is invalid")
      return
    end

    if User.exists?(email: email)
      errors.add(:email, I18n.t(:email_taken, side: "precisionFDA"))
      return
    end

    errors.add(:email, I18n.t(:email_taken, side: "DNAnexus")) if DNAnexusAPI.email_exists?(email)
  end

  def validate_state
    if usa? && !User.validate_state(us_state, postal_code)
      errors.add(:state, "doesn't match postal code")
    end
  end
end

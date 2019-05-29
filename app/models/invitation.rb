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
#  address            :string(255)
#  phone              :string(255)
#  duns               :string(255)
#  ip                 :string(255)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  extras             :text(65535)
#  user_id            :integer
#  state              :string(255)
#  code               :string(255)
#  country            :string(255)
#  city               :string(255)
#  us_state           :string(255)
#  postal_code        :string(255)
#  address1           :string(255)
#  address2           :string(255)
#  phone_country_code :string(255)
#  organization_admin :boolean          default(FALSE), not null
#

class Invitation < ActiveRecord::Base
  include Auditor
  include Humanizer

  belongs_to :user
  belongs_to :country
  belongs_to :phone_country, class_name: 'Country'

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

  validates :singular,
            :organization_admin,
            :research_intent,
            :clinical_intent,
            :participate_intent,
            :organize_intent,
            inclusion: [true, false]

  validate :validate_email,
           :validate_phone,
           # :validate_state,
           :validate_org,
           :validate_org_admin,
           :validate_phone_country_code,
           on: :create

  require_human_on :create

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

  def validate_org
    if org.blank?
      if !singular
        errors.add(
          :org,
          "can't be blank unless you represent yourself"
        )
      end

      if organization_admin
        errors.add(
          :org,
          "can't be blank if you chose that you're an admin of it"
        )
      end
    else
      if singular
        errors.add(
          :org,
          "should be blank if you represent yourself"
        )
      end
    end
  end

  def validate_org_admin
    if organization_admin && singular
      errors.add(
        :base,
        "You can't be an administrator of the organization if you represent yourself"
      )
    end
  end

  def validate_email
    errors.add(:email, "is invalid") unless User.validate_email(email)
  end

  def validate_state
    if usa? && !User.validate_state(us_state, postal_code)
      errors.add(:state, "doesn't match postal code")
    end
  end
end

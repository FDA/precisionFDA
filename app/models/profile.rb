class Profile < ActiveRecord::Base
  belongs_to :user
  belongs_to :country
  belongs_to :phone_country, class_name: 'Country'

  validates :address1, :country, :city, :postal_code, presence: true, if: 'fields_changed?'
  # validates :postal_code, postal_code: true
  validates :us_state, presence: true, if: 'country.try(:usa?) && fields_changed?'
  validates :email, presence: true,
            uniqueness: { case_sensitive: false },
            email: true, if: 'validate_email?'

  def view_fields
    fields = slice(:address1, :address2, :city, :country, :email_confirmed,
      :postal_code, :phone, :us_state, :phone_country, :phone_confirmed)
    fields.merge(email: user.normalized_email)
  end

  def fields_changed?
    [address1_changed?, country_id_changed?, city_changed?,
     postal_code_changed?, us_state_changed?].any?
  end

  def validate_email?
    email_changed? && email.try(:downcase) != email_was.try(:downcase)
  end
end

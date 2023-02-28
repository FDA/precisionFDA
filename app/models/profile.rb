# == Schema Information
#
# Table name: profiles
#
#  id               :integer          not null, primary key
#  address1         :string(255)
#  address2         :string(255)
#  city             :string(255)
#  email            :string(255)
#  email_confirmed  :boolean          default(FALSE)
#  postal_code      :string(255)
#  phone            :string(255)
#  phone_confirmed  :boolean          default(FALSE)
#  us_state         :string(255)
#  user_id          :integer
#  country_id       :integer
#  phone_country_id :integer
#

class Profile < ApplicationRecord
  belongs_to :user
  belongs_to :country
  belongs_to :phone_country, class_name: 'Country'

  validates :email, presence: true,
            uniqueness: { case_sensitive: false },
            email: true,
            if: :validate_email?

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

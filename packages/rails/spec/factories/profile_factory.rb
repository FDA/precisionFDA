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

FactoryBot.define do
  factory :profile do
    email { FFaker::Internet.email }
    phone { FFaker::PhoneNumber.phone_number }
    address1 { FFaker::Address.street_address }
    city { FFaker::Address.city }
    postal_code { FFaker::AddressDE.zip_code }
    us_state { FFaker::AddressUS.state }
    country
    user
  end
end

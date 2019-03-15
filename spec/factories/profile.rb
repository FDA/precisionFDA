FactoryBot.define do
  factory :profile do
    email { FFaker::Internet.email }
    phone { FFaker::PhoneNumber.phone_number }
    address1 { FFaker::Address.street_address }
    city { FFaker::Address.city }
    postal_code { FFaker::AddressDE.zip_code }
    us_state FFaker::AddressUS.state
    country
    user
  end
end

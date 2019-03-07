FactoryBot.define do
  factory :invitation do
    first_name { FFaker::Name.first_name }
    last_name { FFaker::Name.last_name }
    email { FFaker::Internet.email }
    phone { FFaker::PhoneNumber.phone_number }
    address1 { FFaker::Address.street_address }
    address2 { FFaker::Address.street_address }
    city { FFaker::Address.city }
    postal_code { FFaker::AddressDE.zip_code }
    country
    singular { FFaker::Boolean.maybe }
    req_reason { FFaker::Lorem.sentence }
    organization_admin { FFaker::Boolean.maybe }
    research_intent { FFaker::Boolean.maybe }
    clinical_intent { FFaker::Boolean.maybe }
    participate_intent { FFaker::Boolean.maybe }
    organize_intent { FFaker::Boolean.maybe }
    org
    user
  end
end

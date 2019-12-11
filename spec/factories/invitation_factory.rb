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
    phone_country { country }
    req_reason { FFaker::Lorem.sentence }
    research_intent { FFaker::Boolean.maybe }
    clinical_intent { FFaker::Boolean.maybe }
    participate_intent { FFaker::Boolean.maybe }
    organize_intent { FFaker::Boolean.maybe }
    user
  end
end

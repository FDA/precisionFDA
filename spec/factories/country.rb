FactoryBot.define do
  factory :country do
    name { FFaker::Address.country }
    dial_code { FFaker::PhoneNumber.area_code }
  end
end

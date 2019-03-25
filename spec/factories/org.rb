FactoryBot.define do
  factory :org do
    name { FFaker::Company.name }
    sequence(:handle) { |n| "org#{n}" }
  end
end

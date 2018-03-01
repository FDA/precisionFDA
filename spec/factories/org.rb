FactoryBot.define do
  factory :org do
    sequence(:handle) { |n| "org-#{n}" }
  end
end

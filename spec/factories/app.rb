FactoryBot.define do
  factory :app do
    title "default_title"
    association :app_series
    sequence(:dxid) { |n| "app-F8K07#{n}" }
  end
end

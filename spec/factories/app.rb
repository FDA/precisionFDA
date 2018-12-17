FactoryBot.define do
  factory :app do
    title "default_title"
    scope "private"
    association :app_series
    sequence(:dxid) { |n| "app-#{SecureRandom.hex(12)}" }
  end
end

FactoryBot.define do
  factory :job do
    name "default_title"
    association :app_series
    sequence(:dxid) { "job-#{SecureRandom.hex(12)}" }
  end
end

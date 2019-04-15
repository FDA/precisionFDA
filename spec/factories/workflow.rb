FactoryBot.define do
  factory :workflow do
    sequence(:dxid) { |n| "workflow-#{SecureRandom.hex(12)}" }
  end
end

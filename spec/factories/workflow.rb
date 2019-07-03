FactoryBot.define do
  factory :workflow do
    sequence(:dxid) { |n| "workflow-#{SecureRandom.hex(12)}" }

    trait :run_private do
      title "default_title"
      name "default_name"
      scope "private"
      project { "project-#{SecureRandom.hex(12)}" }
      revision 1
    end
  end
end

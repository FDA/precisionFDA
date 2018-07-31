FactoryBot.define do
  factory :space do
    sequence(:name) { |n| "name-#{n}" }
    sequence(:description) { |n| "description-#{n}" }
    sequence(:host_dxorg) { |n| "host_dxorg-#{n}" }
    sequence(:guest_dxorg) { |n| "guest_dxorg-#{n}" }

    trait :group do
      space_type :group

      transient do
        host_lead_id nil
        guest_lead_id nil
      end

      after(:create) do |space, evaluator|
        space.space_memberships.create!(user_id: evaluator.host_lead_id, role: "ADMIN", side: "HOST")
        space.space_memberships.create!(user_id: evaluator.guest_lead_id, role: "ADMIN", side: "GUEST")
      end
    end

  end
end

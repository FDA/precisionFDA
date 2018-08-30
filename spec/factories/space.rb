FactoryBot.define do
  factory :space do
    sequence(:name) { |n| "name-#{n}" }
    sequence(:description) { |n| "description-#{n}" }
    sequence(:host_dxorg) { |n| "host_dxorg-#{n}" }
    sequence(:guest_dxorg) { |n| "guest_dxorg-#{n}" }
    space_id nil

    trait :group do
      space_type :groups

      transient do
        host_lead_id nil
        guest_lead_id nil
      end

      after(:create) do |space, evaluator|
        space.space_memberships.admin.host.create!(user_id: evaluator.host_lead_id)
        space.space_memberships.admin.guest.create!(user_id: evaluator.guest_lead_id)
      end
    end

    trait :review do
      space_type :review

      transient do
        host_lead_id nil
        guest_lead_id nil
      end

      after(:create) do |space, evaluator|
        space.space_memberships.admin.host.create!(user_id: evaluator.host_lead_id)
        space.space_memberships.admin.guest.create!(user_id: evaluator.guest_lead_id)
      end
    end

    trait :accepted do
      host_project 'project-01'
      guest_project 'project-02'
      transient do
        host_lead_id nil
        guest_lead_id nil
      end
      after(:create) do |space, evaluator|
        create(:space, :private_reviewer, reviewer_lead_id: evaluator.host_lead_id, guest_dxorg: nil, host_dxorg: space.host_dxorg, space_id: space.id )
        create(:space, :private_sponsor, sponsor_lead_id: evaluator.guest_lead_id, guest_dxorg: space.guest_dxorg, host_dxorg: nil, space_id: space.id )
      end
    end

    trait :private_reviewer do
      space_type :review
      transient do
        reviewer_lead_id nil
      end
      after(:create) do |space, evaluator|
        space.space_memberships.admin.host.create!(user_id: evaluator.reviewer_lead_id)
      end
    end

    trait :private_sponsor do
      space_type :review
      transient do
        sponsor_lead_id nil
      end
      after(:create) do |space, evaluator|
        space.space_memberships.admin.host.create!(user_id: evaluator.sponsor_lead_id)
      end
    end

  end
end

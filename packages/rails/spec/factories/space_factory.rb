# == Schema Information
#
# Table name: spaces
#
#  id                   :integer          not null, primary key
#  name                 :string(255)
#  description          :text(65535)
#  host_project         :string(255)
#  guest_project        :string(255)
#  host_dxorg           :string(255)
#  guest_dxorg          :string(255)
#  meta                 :text(65535)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  space_id             :integer
#  state                :integer          default("unactivated"), not null
#  space_type           :integer          default("groups"), not null
#  verified             :boolean          default(FALSE), not null
#  sponsor_org_id       :integer
#  restrict_to_template :boolean          default(FALSE)
#  inactivity_notified  :boolean          default(FALSE)
#

FactoryBot.define do
  factory :space do
    sequence(:name) { |n| "name-#{n}" }
    sequence(:description) { |n| "description-#{n}" }
    sequence(:host_dxorg) { |n| "host_dxorg-#{n}" }
    sequence(:guest_dxorg) { |n| "guest_dxorg-#{n}" }
    space_id { nil }

    trait :confidential do
      space_type { :review }
    end

    trait(:active) { state { Space::STATE_ACTIVE } }
    trait(:locked) { state { Space::STATE_LOCKED } }

    trait :group do
      space_type { :groups }

      transient do
        host_lead_id { nil }
        guest_lead_id { nil }
      end

      after(:create) do |space, evaluator|
        space.space_memberships.lead.host.create!(user_id: evaluator.host_lead_id)
        space.space_memberships.lead.guest.create!(user_id: evaluator.guest_lead_id)
      end
    end

    trait :verification do
      space_type { :verification }

      transient do
        host_lead_id { nil }
        guest_lead_id { nil }
      end

      after(:create) do |space, evaluator|
        space.space_memberships.lead.host.create!(user_id: evaluator.host_lead_id)
        space.space_memberships.lead.guest.create!(user_id: evaluator.guest_lead_id)
      end
    end

    trait :verified do
      verified { 1 }
    end

    trait :non_verified do
      verified { 0 }
    end

    trait :review do
      space_type { :review }

      transient do
        host_lead_id { nil }
        guest_lead_id { nil }
      end

      after(:create) do |space, evaluator|
        host_member = space.space_memberships.lead.host.create!(user_id: evaluator.host_lead_id)

        guest_user_id = evaluator.guest_lead_id || create(:user).id
        space.space_memberships.lead.guest.create!(user_id: guest_user_id)

        create(
          :space,
          :confidential,
          guest_dxorg: nil,
          host_dxorg: space.host_dxorg,
          space_id: space.id,
        )
      end
    end

    trait :accepted do
      active

      host_project { 'project-01' }
      guest_project { 'project-02' }

      after(:create) do |space, evaluator|
        return unless space.review?

        space.confidential_reviewer_space.space_memberships << space.host_lead_member

        sponsor_confidential_space = create(:space, :confidential, guest_dxorg: space.guest_dxorg, host_dxorg: nil, space_id: space.id )
        sponsor_confidential_space.space_memberships << space.guest_lead_member
      end
    end
  end
end

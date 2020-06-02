# == Schema Information
#
# Table name: space_memberships
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  meta       :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  active     :boolean          default(TRUE)
#  role       :integer          default("admin"), not null
#  side       :integer          default("host"), not null
#

FactoryBot.define do
  factory :space_membership do
    trait :host do
      side { SpaceMembership::SIDE_HOST }
    end

    trait :guest do
      side { SpaceMembership::SIDE_GUEST }
    end

    trait :viewer do
      role { SpaceMembership::ROLE_VIEWER }
    end

    trait :contributor do
      role { SpaceMembership::ROLE_CONTRIBUTOR }
    end

    trait :admin do
      role { SpaceMembership::ROLE_ADMIN }
    end

    trait :lead do
      role { SpaceMembership::ROLE_LEAD }
    end
  end
end

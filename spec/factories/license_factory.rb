# == Schema Information
#
# Table name: licenses
#
#  id                :integer          not null, primary key
#  content           :text(65535)
#  user_id           :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  title             :string(255)
#  scope             :string(255)
#  approval_required :boolean          default(FALSE), not null
#

FactoryBot.define do
  factory :license do
    user

    title { "default_title" }
    content { "default_content" }

    trait :public do
      scope { Scopes::SCOPE_PUBLIC }
    end

    trait :approval_required do
      approval_required { true }
    end

    trait :no_approval_required do
      approval_required { false }
    end
  end
end

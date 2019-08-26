FactoryBot.define do
  factory :user_file do
    user

    sequence(:dxid) { |n| "file-F8Y8#{n}" }
    sequence(:name) { |n| "file-#{n}" }
    state UserFile::STATE_CLOSED
    parent_type "User"
    sti_type "UserFile"

    trait :public do
      scope :public
    end

    trait :private do
      scope :private
    end
  end
end

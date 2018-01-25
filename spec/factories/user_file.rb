FactoryBot.define do
  factory :user_file do

    sequence(:dxid) { |n| "file-F8Y8#{n}" }
    sequence(:name) { |n| "file-#{n}" }
    state UserFile::STATE_CLOSED
    parent_type "User"

    trait :public do
      scope :public
    end

  end
end

FactoryBot.define do
  factory :folder do
    user

    sequence(:dxid) { |n| "folder-F8Y8#{n}" }
    sequence(:name) { |n| "folder-#{n}" }
    parent_type "User"
    sti_type "Folder"

    trait :private do
      scope :private
    end

    trait :space do
      scope "space-2"
    end
  end
end

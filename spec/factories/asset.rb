FactoryBot.define do
  factory :asset do

    sequence(:dxid) { |n| "file-A1S1#{n}" }
    sequence(:name) { |n| "asset-#{n}" }
    state UserFile::STATE_CLOSED
    parent_type "Asset"

    trait :public do
      scope :public
    end

  end
end

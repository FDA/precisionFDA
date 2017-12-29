FactoryBot.define do
  factory :user do
    dxuser "test_user"
    email "test_user@pfda"
    association :org

    trait :admin do
      dxuser "singer.ma"
    end

  end
end

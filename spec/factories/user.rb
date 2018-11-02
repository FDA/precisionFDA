FactoryBot.define do
  factory :user do
    dxuser "test_user"
    email "test_user@pfda"
    association :org
    last_login 1.day.ago
    private_files_project "project-test"

    trait :admin do
      dxuser "vijay.kandali"
    end

  end
end

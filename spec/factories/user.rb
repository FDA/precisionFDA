FactoryBot.define do
  factory :user do
    first_name { FFaker::Name.first_name }
    last_name { FFaker::Name.last_name }
    dxuser "test_user"
    email { FFaker::Internet.email }
    normalized_email { email.downcase }
    association :org
    last_login 1.day.ago
    private_files_project "project-test"

    trait :admin do
      dxuser "vijay.kandali"
    end

    trait :review_admin do
      dxuser "review.admin_dev"
    end

  end
end

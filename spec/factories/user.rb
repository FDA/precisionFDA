FactoryBot.define do
  factory :user do
    first_name { FFaker::Name.first_name }
    last_name { FFaker::Name.last_name }
    sequence(:dxuser) { |n| "dxuser-#{n}" }
    email { FFaker::Internet.email }
    normalized_email { email.downcase }
    association :org
    last_login 1.day.ago
    private_files_project "project-test"
    public_files_project "public-files-project"

    trait :admin do
      dxuser "vijay.kandali"
    end

    trait :review_admin do
      dxuser "review.admin_dev"
    end

  end
end

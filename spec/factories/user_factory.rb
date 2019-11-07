# == Schema Information
#
# Table name: users
#
#  id                          :integer          not null, primary key
#  dxuser                      :string(255)
#  private_files_project       :string(255)
#  public_files_project        :string(255)
#  private_comparisons_project :string(255)
#  public_comparisons_project  :string(255)
#  schema_version              :integer
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  org_id                      :integer
#  first_name                  :string(255)
#  last_name                   :string(255)
#  email                       :string(255)
#  normalized_email            :string(255)
#  last_login                  :datetime
#  extras                      :text(65535)
#  time_zone                   :string(255)
#  review_app_developers_org   :string(255)      default("")
#  user_state                  :integer          default("enabled"), not null
#  expiration                  :integer
#  disable_message             :string(255)
#

FactoryBot.define do
  factory :user do
    first_name { FFaker::Name.first_name }
    last_name { FFaker::Name.html_safe_last_name }
    sequence(:dxuser) { |n| "dxuser-#{n}" }
    email { FFaker::Internet.email }
    normalized_email { email.downcase }
    association :org
    last_login { 1.day.ago }
    private_files_project { "project-test" }
    public_files_project { "public-files-project" }

    trait :admin do
      dxuser { "vijay.kandali" }
    end

    trait :review_admin do
      dxuser { "review.admin_dev" }
    end
  end
end

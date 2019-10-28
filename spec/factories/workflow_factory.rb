# == Schema Information
#
# Table name: workflows
#
#  id                 :integer          not null, primary key
#  title              :string(255)
#  name               :string(255)
#  dxid               :string(255)
#  user_id            :integer
#  readme             :text(65535)
#  edit_version       :string(255)
#  spec               :text(65535)
#  default_instance   :string(255)
#  scope              :string(255)
#  revision           :integer
#  workflow_series_id :integer
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  uid                :string(255)
#  project            :string(255)
#

FactoryBot.define do
  factory :workflow do
    sequence(:dxid) { |n| "workflow-#{SecureRandom.hex(12)}" }

    trait :run_private do
      title { "default_title" }
      name { "default_name" }
      scope { "private" }
      project { "project-#{SecureRandom.hex(12)}" }
      revision { 1 }
    end
  end
end

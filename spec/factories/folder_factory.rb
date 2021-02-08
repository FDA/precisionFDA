# == Schema Information
#
# Table name: nodes
#
#  id                      :integer          not null, primary key
#  dxid                    :string(255)
#  project                 :string(255)
#  name                    :string(255)
#  state                   :string(255)
#  description             :text(65535)
#  user_id                 :integer          not null
#  file_size               :bigint
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  parent_id               :integer
#  parent_type             :string(255)
#  scope                   :string(255)
#  parent_folder_id        :integer
#  sti_type                :string(255)
#  scoped_parent_folder_id :integer
#  uid                     :string(255)
#

FactoryBot.define do
  factory :folder do
    user

    sequence(:name) { |n| "folder-#{n}" }
    parent_type { "User" }
    sti_type { "Folder" }

    trait :private do
      scope { :private }
    end

    trait :public do
      scope { :public }
    end
  end
end

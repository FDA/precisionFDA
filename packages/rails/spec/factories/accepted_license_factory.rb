# == Schema Information
#
# Table name: accepted_licenses
#
#  id         :integer          not null, primary key
#  license_id :integer
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  state      :string(255)
#  message    :text(65535)
#

FactoryBot.define do
  factory :accepted_license do
    user
    license

    trait :pending do
      state { "pending" }
    end

    trait :active do
      state { "active" }
    end
  end
end

# == Schema Information
#
# Table name: orgs
#
#  id         :integer          not null, primary key
#  handle     :string(255)
#  name       :string(255)
#  admin_id   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  address    :text(65535)
#  duns       :string(255)
#  phone      :string(255)
#  state      :string(255)
#  singular   :boolean
#

FactoryBot.define do
  factory :org do
    name { FFaker::Company.name }
    sequence(:handle) { |n| "org#{n}" }
    state { "" }
  end
end

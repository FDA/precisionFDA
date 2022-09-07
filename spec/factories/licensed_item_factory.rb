# == Schema Information
#
# Table name: licensed_items
#
#  id               :integer          not null, primary key
#  license_id       :integer
#  licenseable_id   :integer
#  licenseable_type :string(255)
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#

FactoryBot.define do
  factory :licensed_item do
    license
  end
end

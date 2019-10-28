# == Schema Information
#
# Table name: space_memberships
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  meta       :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  active     :boolean          default(TRUE)
#  role       :integer          default("admin"), not null
#  side       :integer          default("host"), not null
#

FactoryBot.define do
  factory :space_membership do
  end
end

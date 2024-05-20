# == Schema Information
#
# Table name: admin_groups
#
#  id         :bigint           not null, primary key
#  role       :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

FactoryBot.define do
  factory :admin_group do
    role { AdminGroup::ROLE_SITE_ADMIN }
  end
end

# == Schema Information
#
# Table name: admin_memberships
#
#  id             :integer          not null, primary key
#  user_id        :integer          not null
#  admin_group_id :bigint           not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

class AdminMembership < ApplicationRecord
  belongs_to :user
  belongs_to :admin_group
end

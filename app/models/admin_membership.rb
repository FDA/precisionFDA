# == Schema Information
#
# Table name: admin_memberships
#
#  id             :bigint           not null, primary key
#  user_id        :integer          not null
#  admin_group_id :bigint           not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

# Admin membership maintains users association with admin group.
class AdminMembership < ApplicationRecord
  belongs_to :user
  belongs_to :admin_group

  delegate :role, :site?, :space?, :challenge_admin?, :challenge_eval?, to: :admin_group
end

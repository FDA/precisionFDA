# == Schema Information
#
# Table name: admin_groups
#
#  id         :bigint           not null, primary key
#  role       :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

# Responsible for admin group
class AdminGroup < ApplicationRecord
  has_many :admin_memberships, dependent: :destroy
  has_many :users, through: :admin_memberships

  enum role: { site: 0, space: 1, challenge_admin: 2, challenge_eval: 3 }
end

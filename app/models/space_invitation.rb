# == Schema Information
#
# Table name: space_invitations
#
#  id         :bigint           not null, primary key
#  space_id   :integer          not null
#  inviter_id :integer
#  email      :string(255)      not null
#  role       :string(255)      not null
#  created_at :datetime         not null
#

# Space Invitations
class SpaceInvitation < ApplicationRecord
  belongs_to :inviter, class_name: "User"
  belongs_to :space

  validates :role, presence: true, inclusion: { in: SpaceMembership.roles.keys - %w(lead) }
  validates :email,
            presence: true,
            uniqueness: { scope: :space_id, case_sensitive: false },
            format: { with: User::EMAIL_FORMAT }
end

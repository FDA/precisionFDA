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

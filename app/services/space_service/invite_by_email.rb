module SpaceService
  # Invite an external (non-pFDA) user to space by email
  class InviteByEmail
    def self.call(space, email, admin, role)
      space.space_invitations.create!(inviter: admin.user, email: email, role: role)

      NotificationsMailer.external_user_invited_to_space_email(space, email, admin, role).
        deliver_now!
    end
  end
end

class NotificationsMailerPreview < ActionMailer::Preview
  def invitation_email
    NotificationsMailer.invitation_email(Invitation.last)
  end

  def space_invitation_email
    space = Space.last
    membership = space.space_memberships.last
    admin = space.space_memberships.host.admin.first
    NotificationsMailer.space_invitation_email(space, membership, admin)
  end
end

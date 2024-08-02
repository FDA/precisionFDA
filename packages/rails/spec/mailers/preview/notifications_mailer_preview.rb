class NotificationsMailerPreview < ActionMailer::Preview
  def guest_access_email
    NotificationsMailer.guest_access_email(Invitation.last)
  end

  def invitation_email
    NotificationsMailer.invitation_email(Invitation.last)
  end

  def license_approved_email
    license = License.last
    user = User.last
    NotificationsMailer.license_approved_email(license, user)
  end

  def license_revoked_email
    license = License.last
    user = User.last
    NotificationsMailer.license_revoked_email(license, user)
  end

  def space_activation_email
    space = Space.last
    membership = space.space_memberships.last
    NotificationsMailer.space_activation_email(space, membership)
  end

  def space_activated_email
    space = Space.last
    membership = space.space_memberships.last
    NotificationsMailer.space_activation_email(space, membership)
  end

  def space_invitation_email
    space = Space.last
    membership = space.space_memberships.last
    admin = space.space_memberships.host.admin.first
    NotificationsMailer.space_invitation_email(space, membership, admin)
  end
end

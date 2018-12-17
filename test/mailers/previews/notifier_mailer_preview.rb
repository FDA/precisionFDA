class NotifierPreview < ActionMailer::Preview
  # Secure headers
  SecureHeaders::Configuration.default do |config|
    config.csp = {
      base_uri: %w('self'),
      default_src: %w(https: 'self' 'unsafe-inline'),
      font_src: %w('self' https://fonts.gstatic.com https://cdnjs.cloudflare.com),
      img_src: %w(* data:),
      media_src: %w('self'),
      style_src: %w('self' 'unsafe-inline' https://fonts.googleapis.com https://dnanexus.github.io https://cdnjs.cloudflare.com),
      frame_src: %w('self'),
      frame_ancestors: %w('self')
    }
  end

  def guest_access_email
    NotificationsMailer.guest_access_email(Invitation.last)
  end

  def invitation_email
    NotificationsMailer.invitation_email(Invitation.last)
  end

  def license_request_email
    license = License.last
    user = User.last
    message = "This is a test message"
    NotificationsMailer.license_request_email(license, user, message)
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

  def new_task_email
    task = Task.last
    NotificationsMailer.new_task_email(task)
  end

  def user_failed_to_acknowledge_task_email
    task = Task.last
    NotificationsMailer.user_failed_to_acknowledge_task_email(task)
  end

  def user_failed_to_complete_task_email
    task = Task.last
    NotificationsMailer.user_failed_to_complete_task_email(task)
  end
end

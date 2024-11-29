class NotificationsMailer < ApplicationMailer
  helper :application, :client_url

  if Rails.env.production?
    default  from: "PrecisionFDA <PrecisionFDA@fda.hhs.gov>",
             reply_to: "PrecisionFDA@fda.hhs.gov"
  end

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.notifications.invitation.subject
  #
  def invitation_email(invitation)
    @invitation = invitation
    recipients = ["precisionfda-support@dnanexus.com"]
    recipients << "precisionfda@fda.hhs.gov" if Rails.env.production?

    mail(to: recipients,
         reply_to: "precisionfda-support@dnanexus.com",
         subject: "New access request from #{invitation.first_name} #{invitation.last_name}")
  end

  def license_request_email(license, user, message)
    @license = license
    @user = user
    @message = message
    mail(to: @license.user.email,
         reply_to: @user.email,
         subject: "#{@user.full_name} requested approval to \"#{@license.title}\"")
  end

  def license_approved_email(license, user)
    @license = license
    @user = user
    mail(to: @user.email,
         reply_to: @license.user.email,
         subject: "You were approved for \"#{@license.title}\"")
  end

  def license_revoked_email(license, user)
    @license = license
    @user = user
    mail(to: @user.email,
         reply_to: @license.user.email,
         subject: "Your license was revoked for \"#{@license.title}\"")
  end

  def space_activation_email(space, membership)
    @space = space
    @activation_request_lead =
      if space.administrator?
        membership.side_alias == "host" ? "creator" : "approver"
      else
        "#{membership.side_alias} #{membership.role}"
      end
    @leads_names = space.administrator? ? "creator and approver" : "host and guest"
    @user = membership.user
    mail(to: @user.email,
         subject: "Action required to activate new space \"#{@space.title}\"")
  end

  def space_activated_email(space, membership)
    @space = space
    @user = membership.user
    mail(to: @user.email,
         subject: "Your space was activated: \"#{@space.title}\"")
  end

  def space_invitation_email(space, membership, admin)
    @space = space
    @membership = membership
    @user = membership.user
    @admin = admin

    mail(to: @user.email,
         reply_to: admin.user.email,
         subject: "#{admin.user.full_name} added you to the space \"#{space.title}\"")
  end

  def user_remove_approved_email(org, member, approver)
    @org = org
    @member = member
    @approver = approver

    mail(to: @org.admin.email,
         reply_to: @approver.email,
         subject: "#{@approver.full_name} approved your request to remove #{@member.full_name} "\
                  "from your org (\"#{@org.name}\")")
  end

  def user_leave_approved_email(org, member, approver)
    @org = org
    @member = member
    @approver = approver

    mail(to: @org.admin.email,
         reply_to: @approver.email,
         subject: "#{@approver.full_name} approved #{@member.full_name}'s request to leave "\
                  "your organization (\"#{@org.name}\")")
  end

  def org_dissolve_approved_email(org, approver)
    @org = org
    @approver = approver

    mail(to: @org.admin.email,
         reply_to: @approver.email,
         subject: "#{@approver.full_name} approved your request to dissolve \"#{@org.name}\" org")
  end
end

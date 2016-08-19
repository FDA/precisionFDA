class NotificationsMailer < ApplicationMailer
  default  from: 'PrecisionFDA <PrecisionFDA@fda.hhs.gov>',
           reply_to: "PrecisionFDA@fda.hhs.gov"

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.notifications.invitation.subject
  #
  def invitation_email(invitation)
    @invitation = invitation
    recipients = ["precisionfda-support@dnanexus.com"]
    if ENV["DNANEXUS_BACKEND"] == "production"
      recipients << "precisionfda@fda.hhs.gov"
    end

    mail to: recipients,
         reply_to: "precisionfda-support@dnanexus.com",
         subject: "New access request from #{invitation.first_name} #{invitation.last_name}"
  end

  def guest_access_email(invitation)
    @invitation = invitation
    mail to: @invitation.email,
         bcc: "precisionfda-support@dnanexus.com",
         subject: "Your precisionFDA access request"
  end

  def license_request_email(license, user, message)
    @license = license
    @user = user
    @message = message
    mail to: @license.user.email,
         reply_to: @user.email,
         subject: "#{@user.full_name} requested approval to \"#{@license.title}\""
  end

  def license_approved_email(license, user)
    @license = license
    @user = user
    mail to: @license.user.email,
         reply_to: @user.email,
         subject: "You were approved for \"#{@license.title}\""
  end

  def license_revoked_email(license, user)
    @license = license
    @user = user
    mail to: @user.email,
         reply_to: @license.user.email,
         subject: "Your license was revoked for \"#{@license.title}\""
  end
end

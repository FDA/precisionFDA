class NotificationsMailer < ApplicationMailer

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
         from: 'PrecisionFDA <PrecisionFDA@fda.hhs.gov>',
         bcc: "precisionfda-support@dnanexus.com",
         reply_to: "PrecisionFDA@fda.hhs.gov",
         subject: "Your precisionFDA access request"
  end
end

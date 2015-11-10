class NotificationsMailer < ApplicationMailer

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.notifications.invitation.subject
  #
  def invitation_email(invitation)
    @invitation = invitation

    mail to: ["precisionfda-support@dnanexus.com", "precisionfda@fda.hhs.gov"],
         reply_to: "precisionfda-support@dnanexus.com",
         subject: "New access request from #{invitation.first_name} #{invitation.last_name}"
  end
end

class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("SMTP_FROM_ADDRESS")
  layout "mailer"
end

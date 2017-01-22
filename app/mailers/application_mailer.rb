class ApplicationMailer < ActionMailer::Base
  helper :Application
  default from: "notification@dnanexus.com"
  layout 'mailer'
end

class ApplicationMailer < ActionMailer::Base
  default from: "notification@dnanexus.com"
  layout 'mailer'
end

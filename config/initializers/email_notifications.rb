Rails.application.config.action_mailer.delivery_method = :smtp
Rails.application.config.action_mailer.smtp_settings = {
  address:              'smtp.sendgrid.net',
  port:                 587,
  domain:               'dnanexus.com',
  user_name:            ENV["SENDGRID_USERNAME"],
  password:             ENV["SENDGRID_PASSWORD"],
  authentication:       'plain',
  enable_starttls_auto: true  }
Rails.application.config.action_mailer.perform_deliveries = Rails.env.production?

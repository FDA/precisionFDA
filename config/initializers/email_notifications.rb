Rails.application.config.action_mailer.delivery_method = :smtp
Rails.application.config.action_mailer.smtp_settings = {
  address:              'smtp.gmail.com',
  port:                 587,
  domain:               'dnanexus.com',
  user_name:            'notification@dnanexus.com',
  password:             ENV["GMAIL_PASSWORD"],
  authentication:       'plain',
  enable_starttls_auto: true  }
Rails.application.config.action_mailer.perform_deliveries = Rails.env.production?

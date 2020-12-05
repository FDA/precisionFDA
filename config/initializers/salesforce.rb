# Environment variables:
#  SALESFORCE_USERNAME
#  SALESFORCE_PASSWORD
#  SALESFORCE_SECRET_TOKEN
#  SALESFORCE_HOST
#  SALESFORCE_FDA_EMAIL_ID
#  SALESFORCE_NOTIFIER_EMAIL_ID

ActionMailer::Base.add_delivery_method :salesforce, SalesforceSender

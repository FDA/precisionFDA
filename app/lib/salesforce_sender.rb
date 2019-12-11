# Salesforce mail sender
class SalesforceSender
  attr_accessor :settings

  def initialize(values)
    self.settings = {}.merge!(values)
  end

  def deliver!(mail)
    check_delivery_params!(mail)
    mail_from = Array.wrap(mail.from).first
    authenticate!

    response = client.client.call(
      :send_email,
      message: {
        messages: {
          '@xsi:type': "tns:SingleEmailMessage",
          toAddresses: mail.to,
          replyTo: mail_from,
          subject: mail.subject,
          htmlBody: mail.html_part.body,
          orgWideEmailAddressId: org_wide_email_address_id(mail_from),
          fileAttachments: attachments(mail),
        },
      },
    )

    handle_response!(response)
  end

  private

  def attachments(mail)
    mail.attachments.map do |attachment|
      { fileName: attachment.filename, body: attachment.body.raw_source }
    end
  end

  def from_emails
    {
      /notification@dnanexus.com/i => ENV.fetch("SALESFORCE_NOTIFIER_EMAIL_ID"),
      /precisionfda@fda.hhs.gov/i => ENV.fetch("SALESFORCE_FDA_EMAIL_ID"),
    }
  end

  def org_wide_email_address_id(email)
    from_emails.find do |regex, id|
      return id if regex.match(email)
    end
    raise "org_wide_email_address_id for '#{email}' not found!"
  end

  def handle_response!(response)
    raise response.body.to_s unless response.body.dig(:send_email_response, :result, :success)
  end

  def check_delivery_params!(mail)
    raise ArgumentError, "A from address is required when sending an email" if mail.From.nil?
    raise ArgumentError, "A to address is required when sending an email" if mail.To.nil?
  end

  def authenticate!
    client.authenticate(
      username: ENV.fetch("SALESFORCE_USERNAME"),
      password: "#{ENV.fetch('SALESFORCE_PASSWORD')}#{ENV.fetch('SALESFORCE_SECRET_TOKEN')}",
    )
  end

  def client
    @client ||= Soapforce::Client.new(host: ENV.fetch("SALESFORCE_HOST"))
  end
end

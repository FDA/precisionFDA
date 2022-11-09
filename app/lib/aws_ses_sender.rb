# AWS SES mail sender
class AwsSesSender
  attr_accessor :settings

  def initialize(values)
    self.settings = {}.merge!(values)
  end

  def deliver!(mail)
    check_delivery_params!(mail)
    mail(to: mail.to,
         subject:  mail.subject,
         body: mail.html_part.body,
         content_type: "text/html",
         add_file: attachments(mail))
  end

  private

  def attachments(mail)
    mail.attachments.map do |attachment|
      add_file filename: File.basename(attachment[:filename]), content: File.read(attachment[:filename])
    end
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
end

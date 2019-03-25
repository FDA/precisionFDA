require "aws-sdk-sns"

module SnsService
  extend self

  def call(phone_number, message_text)
    client = Aws::SNS::Client.new(region: 'us-east-1')
    client.set_sms_attributes(attributes: {"DefaultSMSType" => "Transactional"})
    client.publish(phone_number: phone_number, message: message_text)
  end
end

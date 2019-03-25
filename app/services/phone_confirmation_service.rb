module PhoneConfirmationService
  extend self

  def send_code(phone)
    text = PhoneConfirmationService.generate_code
    PhoneConfirmation.create(number: phone, code: text, expired_at: Time.now + 5.minutes)
    if Rails.env.development? || Rails.env.test? || Rails.env.ui_test?
      tmp_file = "#{Rails.root}/tmp/phone_code.txt"
      File.open(tmp_file, 'w') { |f| f.write(text) }
    else
      SnsService.call(phone, text)
    end
  end

  def code_valid?(phone, code)
    PhoneConfirmation.where("expired_at > ? and number = ? and code = ?", Time.now, phone, code)
                     .first
                     .present?
  end

  def generate_code
    str = nil
    loop do
      str = SecureRandom.random_number.to_s.last(6)
      break if str.length == 6
    end
    str
  end

  def check_expired_phone_confirmations
    PhoneConfirmation.where("expired_at < ?", Time.now).destroy_all
  end
end

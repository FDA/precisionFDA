# == Schema Information
#
# Table name: phone_confirmations
#
#  id         :integer          not null, primary key
#  number     :string(255)      not null
#  code       :string(255)      not null
#  expired_at :datetime         not null
#

class PhoneConfirmation < ApplicationRecord
end

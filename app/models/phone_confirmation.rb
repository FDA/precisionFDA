# == Schema Information
#
# Table name: phone_confirmations
#
#  id                          :integer          not null, primary key
#  number                      :string
#  code                        :string
#  expired_at                  :datetime

class PhoneConfirmation < ActiveRecord::Base
end
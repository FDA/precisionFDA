# == Schema Information
#
# Table name: countries
#
#  id        :integer          not null, primary key
#  name      :string(255)
#  dial_code :string(255)
#

FactoryBot.define do
  factory :country do
    name { FFaker::Address.country }
    dial_code { FFaker::PhoneNumber.area_code }
  end
end

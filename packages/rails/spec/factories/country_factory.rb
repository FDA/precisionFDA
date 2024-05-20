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
    name { Country::UNITED_STATES }
    dial_code { Country::UNITED_STATES_AREA_CODE }
  end
end

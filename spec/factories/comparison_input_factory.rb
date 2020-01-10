# == Schema Information
#
# Table name: comparison_inputs
#
#  id            :integer          not null, primary key
#  comparison_id :integer
#  user_file_id  :integer
#  role          :string(255)
#
FactoryBot.define do
  factory :comparison_input do
    role { FFaker::Lorem.word }
  end
end

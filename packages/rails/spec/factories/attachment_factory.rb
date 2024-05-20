# == Schema Information
#
# Table name: attachments
#
#  id        :integer          not null, primary key
#  note_id   :integer
#  item_id   :integer
#  item_type :string(255)
#

FactoryBot.define do
  factory :attachment do
    note_id { FFaker.numerify }
  end
end

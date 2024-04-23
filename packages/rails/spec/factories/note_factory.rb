# == Schema Information
#
# Table name: notes
#
#  id         :integer          not null, primary key
#  title      :string(255)
#  content    :text(65535)
#  user_id    :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  scope      :string(255)
#  note_type  :string(255)
#

FactoryBot.define do
  factory :note do
    user
    title { "note_title" }
  end
end

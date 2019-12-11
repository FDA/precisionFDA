# == Schema Information
#
# Table name: participants
#
#  id         :integer          not null, primary key
#  title      :string(255)
#  image_url  :string(255)
#  node_id    :integer
#  public     :boolean
#  kind       :integer          default("invisible")
#  position   :integer          default(0)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

FactoryBot.define do
  factory :participant do
    title { FFaker::Name.first_name }
    image_url { FFaker::Internet.uri("https") }
  end
end

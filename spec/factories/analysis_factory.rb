# == Schema Information
#
# == Schema Information
#
# Table name: analyses
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  dxid        :string(255)
#  user_id     :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  workflow_id :integer
#  batch_id    :string(255)
#

FactoryBot.define do
  factory :analysis do
    user
    workflow

    name { "default_title" }
    sequence(:dxid) { "job-#{SecureRandom.hex(12)}" }
  end
end

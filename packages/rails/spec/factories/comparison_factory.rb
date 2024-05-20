# == Schema Information
#
# Table name: comparisons
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  description :text(65535)
#  user_id     :integer
#  state       :string(255)
#  dxjobid     :string(255)
#  project     :string(255)
#  meta        :text(65535)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  scope       :string(255)
#  app_dxid    :string(255)      not null
#  run_input   :text(65535)
#
FactoryBot.define do
  factory :comparison do
    name { FFaker::Lorem.word }
    state { "done" }
    scope { "private" }
    sequence(:dxjobid) { |n| "job-#{n}" }
  end
end

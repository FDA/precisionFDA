# == Schema Information
#
# Table name: tasks
#
#  id                  :integer          not null, primary key
#  user_id             :integer
#  space_id            :integer
#  assignee_id         :integer          not null
#  status              :integer          default("open"), not null
#  name                :string(255)
#  description         :text(65535)
#  response_deadline   :datetime
#  completion_deadline :datetime
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  response_time       :datetime
#  complete_time       :datetime
#

FactoryBot.define do
  factory :task do
    space
    user_id { space.space_memberships.where(side: "host").first.user_id }
    assignee_id { space.space_memberships.where(side: "guest").first.user_id }

    response_deadline { Time.now + 1.day }
    completion_deadline { Time.now + 2.days }
    sequence(:name) { |n| "name-#{n}" }
    description { "description" }
    status { 0 }
  end
end

FactoryBot.define do
  factory :task do
    space
    user_id { space.space_memberships.where(side: "host").first.user_id }
    assignee_id { space.space_memberships.where(side: "guest").first.user_id }

    response_deadline { Time.now + 1.day }
    completion_deadline { Time.now + 2.days }
    sequence(:name) { |n| "name-#{n}" }
    description "description"
    status 0
  end
end

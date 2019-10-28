# == Schema Information
#
# Table name: org_action_requests
#
#  id           :bigint           not null, primary key
#  org_id       :integer          not null
#  initiator_id :integer          not null
#  action_type  :string(255)      not null
#  state        :string(255)      not null
#  member_id    :integer
#  created_at   :datetime         not null
#  approver_id  :integer
#  approved_at  :datetime
#  resolved_at  :datetime
#  info         :text(65535)
#

FactoryBot.define do
  factory :org_action_request do
    association :initiator, factory: :user
    org
    state { OrgActionRequest::State::NEW }

    factory :org_action_request_remove_member do
      association :member, factory: :user
      action_type { OrgActionRequest::Type::REMOVE_MEMBER }
    end

    factory :org_action_request_leave do
      action_type { OrgActionRequest::Type::LEAVE }
    end

    factory :org_action_request_dissolve do
      action_type { OrgActionRequest::Type::DISSOLVE }
    end
  end
end

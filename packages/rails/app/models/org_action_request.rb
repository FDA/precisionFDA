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

# Responsible for org-related action requests.
class OrgActionRequest < ApplicationRecord
  # Contains available action types.
  module Type
    DISSOLVE = "dissolve".freeze
    LEAVE = "leave".freeze
    LEAVE_ON_DISSOLVE = "leave_on_dissolve".freeze
    REMOVE_MEMBER = "remove_member".freeze
  end

  # Contains request states.
  module State
    # Request is just created.
    NEW = "new".freeze

    # Request is approved by admin, but required actions weren't run still.
    APPROVED = "approved".freeze

    # Required actions are being performed.
    PROCESSING = "processing".freeze

    # Required actions are completed.
    RESOLVED = "resolved".freeze
  end

  belongs_to :org, -> { unscope(where: :state) }
  belongs_to :initiator, class_name: "User"
  belongs_to :member, class_name: "User"
  belongs_to :approver, class_name: "User"

  store :info, coder: JSON

  scope :leave, -> {
    where(action_type: Type::LEAVE).or(
      where(action_type: Type::LEAVE_ON_DISSOLVE),
    )
  }

  [State::NEW, State::APPROVED, State::PROCESSING, State::RESOLVED].each do |state_value|
    define_method "#{state_value}?" do
      state == state_value
    end
  end

  [Type::DISSOLVE, Type::LEAVE, Type::LEAVE_ON_DISSOLVE, Type::REMOVE_MEMBER].each do |type|
    define_method "#{type}?" do
      action_type == type
    end
  end
end

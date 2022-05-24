# == Schema Information
#
# Table name: space_events
#
#  id            :integer          not null, primary key
#  user_id       :integer          not null
#  space_id      :integer          not null
#  entity_id     :integer          not null
#  entity_type   :string(255)      not null
#  activity_type :integer          not null
#  side          :integer          not null
#  created_at    :datetime         not null
#  object_type   :integer          not null
#  role          :integer          not null
#  data          :text(65535)
#

class SpaceEvent < ApplicationRecord
  OBJECT_TYPES = {
    space: 0,
    membership: 1,
    comment: 3,
    app: 4,
    job: 5,
    file: 6,
    asset: 7,
    comparison: 8,
    workflow: 9,
    note: 10,
  }.freeze

  ACTIVITY_TYPES = {
    membership_added: 0,
    membership_disabled: 1,
    membership_changed: 2,
    job_added: 8,
    job_completed: 9,
    file_added: 10,
    file_deleted: 11,
    note_added: 12,
    app_added: 13,
    asset_added: 14,
    asset_deleted: 15,
    comparison_added: 16,
    workflow_added: 17,
    comment_added: 18,
    comment_edited: 19,
    comment_deleted: 20,
    space_locked: 21,
    space_unlocked: 22,
    space_deleted: 23,
    task_accepted: 24,
    task_reopened: 25,
    membership_enabled: 26,
    membership_deleted: 27,
  }.freeze

  ROLES = %i(
    admin
    contributor
    viewer
    lead
  ).freeze

  DATA_ATTRIBUTES = {
    comment: %i(body),
    app: %i(title),
    note: %i(title),
    space: %i(name),
    job: %i(name),
    file: %i(name uid),
    asset: %i(name uid),
    comparison: %i(name),
    workflow: %i(name),
  }.freeze

  belongs_to :user
  belongs_to :space
  belongs_to :entity, polymorphic: true

  enum side: [SpaceMembership::SIDE_HOST, SpaceMembership::SIDE_GUEST]
  enum activity_type: ACTIVITY_TYPES
  enum object_type: OBJECT_TYPES
  enum role: ROLES

  store :data, coder: JSON

  before_create :sort_object_type, :generate_data

  def data
    super || {}
  end

  private

  def sort_object_type
    self.object_type = activity_type.split("_").first
  end

  def generate_data
    new_data = SpaceEvent::DATA_ATTRIBUTES.find(-> {{}}) do |type, attributes|
      break entity.slice(*attributes) if type.to_s == object_type
    end

    if membership?
      new_data["role"] = entity.role
      new_data["full_name"] = entity.user.full_name
    end

    self.data = new_data
  end
end

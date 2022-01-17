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
  OBJECT_TYPES = %i(
    space
    membership
    task
    comment
    app
    job
    file
    asset
    comparison
    workflow
    note
  ).freeze

  ACTIVITY_TYPES = %i(
    membership_added
    membership_disabled
    membership_changed
    task_created
    task_reassigned
    task_completed
    task_declined
    task_deleted
    job_added
    job_completed
    file_added
    file_deleted
    note_added
    app_added
    asset_added
    asset_deleted
    comparison_added
    workflow_added
    comment_added
    comment_edited
    comment_deleted
    space_locked
    space_unlocked
    space_deleted
    task_accepted
    task_reopened
    membership_enabled
  ).freeze

  ROLES = %i(
    admin
    contributor
    viewer
    lead
  ).freeze

  DATA_ATTRIBUTES = {
    :comment    => %i(body),
    :app        => %i(title),
    :note       => %i(title),
    :space      => %i(name),
    :task       => %i(name),
    :job        => %i(name),
    :file       => %i(name uid),
    :asset      => %i(name uid),
    :comparison => %i(name),
    :workflow   => %i(name),
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

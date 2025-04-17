module SpaceEventService
  EVENTS_MAPPING = {
    "app" => :app_added,
    "comparison" => :comparison_added,
    "file" => :file_added,
    "asset" => :asset_added,
    "job" => :job_added,
    "note" => :note_added,
    "workflow" => :workflow_added,
  }.freeze

  class << self
    def call(space_id, user_id, membership, entity, activity_type, nodejs_api_client = nil)
      membership ||= Space.find(space_id).space_memberships.find_by(user_id: user_id) ||
                     SpaceMembership.new_by_admin(User.find(user_id))

      activity_type = EVENTS_MAPPING[entity.klass] if activity_type == "copy_to_cooperative"

      space_event = SpaceEvent.create!(
        space_id: space_id,
        user_id: user_id,
        side: membership[:side],
        role: membership[:role],
        entity:,
        activity_type:,
      )

      # Ensure the DB writes are committed before calling the Node.js service
      ActiveRecord::Base.connection.commit_db_transaction

      # Now it's safe to call NotificationSender
      api = nodejs_api_client || HttpsAppsClient.new
      NotificationSender.call(space_event, api)
    end
  end
end

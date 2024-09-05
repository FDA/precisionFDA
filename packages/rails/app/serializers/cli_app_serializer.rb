# App serializer.
class CliAppSerializer < ApplicationSerializer # rubocop:disable Metrics/ClassLength

  # Specifying attributes. Those not needing camelCase conversion are aggregated in the attributes call.
  attributes :id, :uid, :dxid, :name, :title, :location, :readme, :revision, :org, :explorers, :featured, :active

  # Attributes requiring camelCase conversion using the key option
  attribute :entity_type, key: :entityType
  attribute :added_by, key: :addedBy
  attribute :added_by_fullname, key: :addedByFullname
  attribute :created_at, key: :createdAt
  attribute :created_at_date_time, key: :createdAtDateTime
  attribute :updated_at, key: :updatedAt
  attribute :workstation_api_version, key: :workstationApiVersion
  attribute :forked_from, key: :forkedFrom
  attribute :app_series_id, key: :appSeriesId

  # Custom attributes with camelCase keys specified
  attribute :all_tags_list, key: :tags
  attribute :properties_object, key: :properties
  attribute :latest_revision, key: :latestRevision
  attribute :scope_id, key: :scope

  # Delegations remain as is, since they are method calls not directly related to JSON key naming
  delegate :updated_at, to: :object
  delegate :workstation_api_version, to: :object

  def scope_id
    object.scope
  end

  # Returns a tags list for an App
  def all_tags_list
    object.app_series.all_tags_list
  end

  def properties_object
    props = {}
    object.app_series.properties.each do |prop|
      props[prop.property_name] = prop.property_value
    end
    props
  end

  # Returns an app user org handle.
  # @return [String] handle.
  def org
    object.org&.handle
  end

  # Returns a quantity of explorers of app.
  # @return [Integer] A quantity.
  def explorers
    object.app_series.jobs.distinct.select(:user_id).count
  end

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end

  # Returns if App was marked as 'deleted'.
  def active
    object.not_deleted?
  end

  # Returns if App is in it's latest revision
  def latest_revision
    object.id == object.app_series.latest_revision_app_id
  end

  private

  # Returns an array of apps ids which have jobs, runned by current_user.
  # @return [Array<Integer>] App IDs.
  def app_ids
    return [] unless current_user

    object.app_series.jobs.where(user: current_user).select(:app_id).distinct.map(&:app_id)
  end
end

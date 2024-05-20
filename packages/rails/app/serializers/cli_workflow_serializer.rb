# Workflow serializer.
class CliWorkflowSerializer < ApplicationSerializer
  # Specifying attributes that do not require camelCase conversion directly
  attributes :id, :uid, :name, :title, :location, :revision, :readme, :version, :scope, :featured, :active, :jobs

  # Attributes requiring camelCase conversion using the key option
  attribute :added_by, key: :addedBy
  attribute :created_at, key: :createdAt
  attribute :created_at_date_time, key: :createdAtDateTime
  attribute :launched_by, key: :launchedBy
  attribute :launched_on, key: :launchedOn
  attribute :workflow_series_id, key: :workflowSeriesId
  attribute :logged_dxuser, key: :loggedDxuser

  attribute :all_tags_list, key: :tags
  attribute :job_count, key: :jobCount
  attribute :properties_object, key: :properties

  # Returns manually assigned jobs - do not confuse with object.jobs.
  attr_accessor :jobs
  attr_reader :launched_on
  attr_writer :title

  delegate :uid, :location, :name, to: :object

  def title
    @title || object.title
  end

  def job_count
    object.analyses.distinct.count
  end

  # Returns a tags list for a Workflow
  def all_tags_list
    object.workflow_series.all_tags_list
  end

  def properties_object
    props = {}
    object.properties.each do |prop|
      props[prop.property_name] = prop.property_value
    end
    props
  end

  # Returns a user who has created this workflow.
  # @return [String] User full name.
  def added_by
    object.user.full_name
  end

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end

  # Returns a user who has created this WorkFlow.
  # @return [String] User full_name.
  def launched_by
    added_by_fullname
  end

  # Writer for formatted launched_on time.
  def launched_on=(launched_on)
    @launched_on = formatted_date_time(launched_on || Time.current)
  end

  # Returns edit version.
  def version
    object.edit_version
  end

  # Returns if Workflow was marked as 'deleted'.
  def active
    object.not_deleted?
  end

  delegate :scope, to: :object
end

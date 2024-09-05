# Simple Job serializer - removed nodes inputs/outputs mappings.
class SimpleJobSerializer < ApplicationSerializer
  include ActionView::Helpers
  include ApplicationHelper

  attributes(
    :id,
    :uid,
    :state,
    :name,
    :app_title,
    :app_uid,
    :workflow_uid,
    :duration,
    :duration_in_seconds,
    :energy_consumption,
    :instance_type,
    :launched_on,
    :created_at_date_time,
    :links,
    :location,
    :logged_dxuser,
  )

  attribute :all_tags_list, key: :tags
  attr_reader :launched_on

  delegate :name, :location, to: :object
  delegate :failure_reason, :failure_message, to: :object

  # TODO: (samuel) - fix properly by adding NOT NULL constraint on db column
  # Returns a title of an app.
  # @return [String] app title.
  def app_title
    object.app&.title
  end

  def app_uid
    object.app&.uid
  end

  # TODO: (samuel) - fix properly by adding NOT NULL constraint on db column
  # Returns a revision of an app.
  # @return [Numeric] app revision.
  def app_revision
    object.app&.revision
  end

  # TODO: (samuel) - fix properly by adding NOT NULL constraint on db column
  # Returns if app is active (not-deleted).
  # @return [Boolean] app active flag.
  def app_active
    object.app&.not_deleted?
  end

  # Returns a user who has created this Job.
  # @return [String] User full_name.
  def launched_by
    added_by_fullname
  end

  # Writer for formatted launched_on time.
  def launched_on=(launched_on)
    @launched_on = formatted_date_time(launched_on || Time.current)
  end

  # Returns a uid of a workflow if it is available for the app.
  # @return [String] workflow uid.
  def workflow_uid
    if object.try(:analysis).try(:workflow)
      object.analysis.workflow.uid
    else
      "N/A"
    end
  end

  # Returns a title of a workflow if it is available for the app.
  # @return [String] workflow title.
  def workflow_title
    if object.try(:analysis).try(:workflow)
      object.analysis.workflow.title
    else
      "N/A"
    end
  end

  # Returns an instance_type of the app.
  # @return [String] instance_type.
  def instance_type
    object.resolved_instance_type
  end

  # Returns a duration of the app execution in seconds.
  # @return [String] duration.
  def duration_in_seconds
    object.runtime
  end

  # Returns a duration of the app execution in a days/hours/minutes/seconds format.
  # @return [String] duration.
  def duration
    humanize_seconds(object.runtime)
  end

  # Returns an energy_consumption when the app is executed.
  # @return [String] energy_consumption.
  def energy_consumption
    object.energy_string
  end

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end

  # Builds links.
  # @return [Hash] Links.
  def links
    return {} unless logged_user

    {}.tap do |links|
      # show job details page - api_job_path
      links[:show] = job_path(object)
      # link to user who run a job - api_job_path
      # show job's app details page - api_app_path
      links[:app] = app_path(object.app) if object.app
      # show job's workflow details page
      links[:workflow] =
        object.try(:analysis).try(:workflow) ? workflow_path(object.analysis.workflow) : "N/A"
    end
  end

  delegate :scope, to: :object
end

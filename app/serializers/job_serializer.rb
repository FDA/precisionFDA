# Job serializer.
class JobSerializer < ApplicationSerializer
  attributes(
    :id,
    :state,
    :name,
    :app_title,
    :workflow_title,
    :instance_type,
    :duration,
    :energy_consumption,
    :created_at,
    :scope,
    :links,
  )

  attribute :all_tags_list, key: :tags

  # Returns a title of an app.
  # @return [String] app title.
  def app_title
    object.app.title
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
    return unless current_user

    {}.tap do |links|
      links[:show] = job_path(object)
      links[:app] = app_path(object.app)
      links[:workflow] =
        object.try(:analysis).try(:workflow) ? workflow_path(object.analysis.workflow) : "N/A"
    end
  end

  delegate :scope, to: :object

  # Returns a pretty view of duration of the app execution to a
  #   pretty reading format in days/hours/minutes/seconds.
  #   Example: "385 days 19 hours 15 minutes 33 seconds"
  # @return [String] duration format.
  def humanize_seconds(secs)
    secs = secs.to_i
    if secs <= 0
      "N/A"
    else
      [[60, :seconds], [60, :minutes], [24, :hours], [1000, :days]].map do |count, name|
        if secs.positive?
          secs, n = secs.divmod(count)
          "#{n.to_i} #{name}"
        end
      end.compact.reverse.join(" ")
    end
  end
end

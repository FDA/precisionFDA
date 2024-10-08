# Job serializer.
class JobSerializer < ApplicationSerializer # rubocop:disable Metrics/ClassLength
  include ActionView::Helpers
  include ApplicationHelper

  attributes(
    :id,
    :uid,
    :dxid,
    :state,
    :name,
    :app_title,
    :app_uid,
    :app_revision,
    :app_active,
    :workflow_title,
    :workflow_uid,
    :platform_tags,
    :workstation_api_version,
    :run_input_data,
    :run_output_data,
    :run_data_updates,
    :instance_type,
    :duration,
    :duration_in_seconds,
    :energy_consumption,
    :failure_reason,
    :failure_message,
    :created_at,
    :created_at_date_time,
    :scope,
    :location,
    :launched_by,
    :launched_by_dxuser,
    :launched_on,
    :featured,
    :links,
    :entity_type,
    :logged_dxuser,
    :cost_limit,
  )

  attribute :all_tags_list, key: :tags
  attribute :properties_object, key: :properties
  attr_reader :launched_on

  delegate :name, :location, to: :object
  delegate :failure_reason, :failure_message, to: :object

  # Returns a run input_data for each input.
  # @return [Array] of objects [
  #     {"name":"f1","klass":"file",
  #       "file":"\u003cspan class=\"fa fa-file-o \"\u003e \u003c/span\u003e rubocop logo.png"}
  #   ]
  def run_input_data
    input_data = []
    object.input_data.each do |item|
      input_data << form_item_run_data(item)
    end

    input_data
  end

  # Returns a run output_data for each output.
  # @return [Array] of objects [
  #     {"name":"qf1","klass":"file",
  #       "file":"\u003cspan class=\"fa fa-file-o \"\u003e \u003c/span\u003e file_john_out.txt"}
  #   ]
  def run_output_data
    output_data = []
    object.output_data.each do |item|
      output_data << form_item_run_data(item)
    end

    output_data
  end

  # Returns a run_data output file uid, updated if output is of type 'file'
  # @return run_data [Hash] Contains:
  #   { ... "run_outputs" => { "qf1 " => "file-Fz1qBXQ06fZ9PGyy3yKxqb0j-1" } }
  # Be careful that not all run_outputs values are strings, e.g.
  #   { ... "run_outputs" => { "float_output" => 0.997611725020877 } }
  def run_data_updates
    object.run_data["run_outputs"]&.each { |_k, v| v&.concat("-1") if v.is_a?(String) && v[0..3] == "file" }
    object.run_data
  end

  def properties_object
    props = {}
    object.properties.each do |prop|
      props[prop.property_name] = prop.property_value
    end
    props
  end

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

  # Returns the dxuser who has created this Job.
  # @return [String] dxuser
  def launched_by_dxuser
    added_by
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

  def platform_tags
    object.app&.platform_tags
  end

  def workstation_api_version
    object.app&.workstation_api_version
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

  # Check whether job object could be published - means,
  # current_user is the owner of the job, independently of object scope.
  # At the same time job should be in a terminal state and not be public already
  def publishable_by_owner
    object.user.id == logged_user.id && object.terminal? && !object.public?
  end

  # Builds links.
  # @return [Hash] Links.
  def links
    return {} unless logged_user

    {}.tap do |links|
      # show job details page - api_job_path
      links[:show] = job_path(object)
      # link to user who run a job - api_job_path
      links[:user] = user_path(object.user.dxuser)
      # TODO: (samuel) - fix properly by adding NOT NULL constraint on db column
      # show job's workflow details page
      links[:workflow] =
        object.try(:analysis).try(:workflow) ? workflow_path(object.analysis.workflow) : "N/A"

      # publish single job if it is not public already
      links[:publish] = publish_object if publishable_by_owner

      # GET show job's logs page: TODO: move to api/jobs
      links[:log] = log_job_path(object)
      # POST /api/attach_to: api_attach_to_notes, discussions, answers
      links[:attach_to] = api_attach_to_notes_path
      # POST /api/jobs/copy  copy_api_jobs
      links[:copy] = copy_api_jobs_path
      # POST /api/jobs/terminate
      links[:terminate] = terminate_api_jobs_path unless object.terminal?

      if object.https? && object.running? && object.https_app_ready?
        # GET /api/jobs/:id/open_external
        links[:open_external] = open_external_api_job_path(object)
      end

      if logged_user.can_administer_site?
        # PUT /api/jobs/feature
        links[:feature] = feature_api_jobs_path
      end
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

  private

  # A common method for run data creation% for inputs and outputs
  # @param item [Object] Job class
  # @return item_run_data [Hash] - the following object:
  #  { "name":"f1", "klass":"file", "file_name":"rubocop logo.png",
  #    "label":"qf1", "file_uid":"file-Fyq3zp80gKgFG33Z3yyb2kfp-1" }
  def form_item_run_data(item)
    item_run_data = {}
    item_run_data.merge!(name: item.name)
    item_run_data.merge!(class: item.klass)
    item_run_data.merge!(label: item.label) if item.label.present?

    if item.file?
      if item.file.present?
        item_run_data.merge!(file_name: item.file.name)
        item_run_data.merge!(file_uid: item.file.uid)
        item_run_data.merge!(state: item.file.state)
        item_run_data.merge!(scope: item.file.scope)
      else
        item_run_data.merge!(value: item.value)
        item_run_data.merge!(state: "deleted")
      end
    elsif item.files?
      file_names = item.files.compact.map(&:name)
      file_uids = item.files.compact.map(&:uid)
      scopes = item.files.compact.map(&:scope)

      item_run_data.merge!(file_names:)
      item_run_data.merge!(file_uids:)
      item_run_data.merge!(scopes:)
    else
      item_run_data.merge!(value: item.value)
    end

    item_run_data
  end
end

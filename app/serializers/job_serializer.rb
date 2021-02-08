# Job serializer.
class JobSerializer < ApplicationSerializer
  include ActionView::Helpers
  include ApplicationHelper

  attributes(
    :id,
    :uid,
    :state,
    :name,
    :app_title,
    :app_revision,
    :app_active,
    :workflow_title,
    :workflow_uid,
    :run_input_data,
    :run_output_data,
    :run_data_updates,
    :instance_type,
    :duration,
    :duration_in_seconds,
    :energy_consumption,
    :created_at,
    :created_at_date_time,
    :scope,
    :location,
    :launched_by,
    :launched_on,
    :featured,
    :links,
    :logged_dxuser,
  )

  attribute :all_tags_list, key: :tags
  attr_reader :launched_on

  delegate :name, to: :object

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
  def run_data_updates
    object.run_data["run_outputs"]&.each { |_k, v| v&.concat("-1") if v[0..3] == "file" }
    object.run_data
  end

  # Returns a title of an app.
  # @return [String] app title.
  def app_title
    object.app.title
  end

  # Returns a revision of an app.
  # @return [Numeric] app revision.
  def app_revision
    object.app.revision
  end

  # Returns if app is active (not-deleted).
  # @return [Boolean] app active flag.
  def app_active
    object.app.not_deleted?
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
      # show job's app details page - api_app_path
      links[:app] = app_path(object.app)
      # show job's workflow details page
      links[:workflow] =
        object.try(:analysis).try(:workflow) ? workflow_path(object.analysis.workflow) : "N/A"

      # publish single job if it is not public already
      links[:publish] = publish_object if publishable_by_owner

      # GET show job's logs page: TODO: move to api/jobs
      links[:log] = log_job_path(object)
      # GET track single object
      links[:track] = track_object
      # POST /api/attach_to: api_attach_to_notes, discussions, answers
      links[:attach_to] = api_attach_to_notes_path
      # POST /api/jobs/copy  copy_api_jobs
      links[:copy] = copy_api_jobs_path
      # POST /api/jobs/terminate
      links[:terminate] = terminate_api_jobs_path unless object.terminal?
      # this job's app single run
      if object.in_space?
        unless member_viewer?
          links[:run_job] = new_app_job_path(
            object.app.app_series.latest_version_app || object.app.app_series.latest_revision_app,
          )
          links[:space] = space_path
        end
      else
        links[:run_job] = new_app_job_path(
          object.app.app_series.latest_version_app || object.app.app_series.latest_revision_app,
        )
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
      else
        item_run_data.merge!(value: item.value)
      end
    else
      item_run_data.merge!(value: item.value)
    end

    item_run_data
  end
end

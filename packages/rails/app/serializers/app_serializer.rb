# App serializer.
class AppSerializer < ApplicationSerializer # rubocop:disable Metrics/ClassLength
  attributes(
    :id,
    :uid,
    :dxid,
    :entity_type,
    :name,
    :title,
    :added_by,
    :added_by_fullname,
    :created_at,
    :created_at_date_time,
    :updated_at,
    :platform_tags,
    :workstation_api_version,
    :location,
    :readme,
    :scope,
    :forked_from,
    :revision,
    :app_series_id,
    :run_by_you,
    :org,
    :explorers,
    :featured,
    :active,
    :links,
  )

  attribute :all_tags_list, key: :tags
  attribute :properties_object, key: :properties
  attribute :latest_revision, key: :latest_revision
  attribute :scope_id, key: :scope
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

  # Returns a string with text explanation about previous runnnings of the app by current_user.
  # @return [String, nil] Text explanation or nil if app's space is locked.
  def run_by_you
    return unless can_run?

    if run_by_you?
      "Yes"
    elsif app_ids.present?
      "Not this revision"
    elsif !object.in_locked_space?
      "Try"
    end
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

  # Builds links.
  # @return [Hash] Links.
  # rubocop:disable Metrics/MethodLength
  def links
    return {} unless current_user

    # rubocop:disable Metrics/BlockLength
    {}.tap do |links|
      user_role = if object.in_space?
        object.space_object.space_memberships.active.find_by(user: current_user.id).role
      else
        "can_run"
      end
      links[:show] = app_path(object)
      links[:user] = user_path(added_by)
      links[:space] = space_path if object.in_space?
      links[:jobs] = jobs_api_app_path(object)
      # GET /apps/:id/fork - fork a single app
      links[:fork] = fork_app_path(object) unless object.https?
      links[:forked_from] = "/home/apps/#{object.forked_from}" if object.forked_from
      # POST export a single app to a docker container
      links[:export] = export_app_path(object)
      # GET cwl_export a single app to a cwl file
      links[:cwl_export] = cwl_export_app_path(object)
      # GET wdl_export a single app to a wdl file
      links[:wdl_export] = wdl_export_app_path(object)
      # POST /api/apps/copy  copy_api_apps
      links[:copy] = copy_api_apps_path

      if object.owned_by_user?(current_user)
        # POST /api/attach_to: api_attach_to_notes, discussions, answers
        links[:attach_to] = api_attach_to_notes_path
        unless object.in_space? && member_viewer?
          # PUT /api/workflows/delete soft delete
          links[:delete] = delete_api_apps_path if user_role != "viewer"
          # edit a single app TODO: create update in api/apps_controller
          links[:edit] = edit_app_path(object) if user_role != "viewer"
        end
        links[:edit_tags] = api_set_tags_path if
          object.owned_by_user?(current_user)

        # POST set app as challenge App
        links[:assign_app] = api_assign_app_path
        # publish single app if it is not public already or it is not in space
        links[:publish] = publish_object unless object.public? || object.in_space?
      end

      if can_run? && !object.in_locked_space?
        # app single run
        links[:run_job] = new_app_job_path(object.uid) if user_role != "viewer"
      end
      unless object.in_space?
        # app single run
        links[:run_job] = new_app_job_path(object.uid)
      end
      if current_user.can_administer_site?
        # PUT /api/apps/feature
        links[:feature] = feature_api_apps_path
      end
    end
    # rubocop:enable Metrics/BlockLength
  end
  # rubocop:enable Metrics/MethodLength

  private

  # Checks if user has permissions to run the app.
  # @return [Boolean] Returns true if a user can run the app, false otherwise.
  def can_run?
    return false unless current_user

    object.runnable_by?(current_user)
  end

  # Returns an array of apps ids which have jobs, runned by current_user.
  # @return [Array<Integer>] App IDs.
  def app_ids
    return [] unless current_user

    object.app_series.jobs.where(user: current_user).select(:app_id).distinct.map(&:app_id)
  end

  def run_by_you?
    app_ids.include?(object.app_series.latest_version_app_id)
  end
end

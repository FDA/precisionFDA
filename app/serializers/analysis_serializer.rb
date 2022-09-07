# Analysis serializer
class AnalysisSerializer < ApplicationSerializer
  include Permissions
  include ApplicationHelper

  attributes(
    :active, :app_title, :added_by, :added_by_fullname,
    :created_at, :dxid, :featured, :id, :in_space,
    :jobs, :launched_by, :launched_on, :location, :links,
    :name, :object_type, :revision, :user, :uid, :version,
    :workflow_series_id, :workflow, :workflow_title
  )

  def uid
    object.workflow.uid
  end

  def in_space
    object.workflow.in_space?
  end

  def added_by
    added_by_fullname
  end

  def revision
    object.workflow.revision
  end

  def featured
    object.workflow.featured
  end

  def active
    object.workflow.not_deleted?
  end

  def workflow_series_id
    object.workflow.workflow_series_id
  end

  def version
    object.workflow.edit_version
  end

  def location
    ""
  end

  def app_title
    ""
  end

  def workflow_title
    (object.workflow.title.presence + batch_meta) || "N/A"
  end

  def launched_by
    added_by_fullname
  end

  def launched_on
    formatted_date_time object.created_at
  end

  def links
    return {} unless logged_user

    {}.tap do |links|
      links[:show] = workflow_path(object.workflow) if accessible_by_user?(logged_user)
      links[:user] = user_path(object.workflow.user.dxuser)
      links[:space] = "/spaces/#{object.workflow.space_object.id}" if object.workflow.in_space?
      links[:attach_to] = api_attach_to_notes_path
      links[:copy] = copy_api_workflows_path
      links[:run_workflow] = api_run_workflow_path
      links[:batch_run_workflow] = batch_workflow_workflow_path(object.workflow)
      links[:edit] = edit_workflow_path(object.workflow)
      links[:fork] = fork_workflow_path(object.workflow)
      links[:cwl_export] = cwl_export_workflow_path(object.workflow)
      links[:wdl_export] = wdl_export_workflow_path(object.workflow)
      if object.workflow.owned_by_user?(object.workflow.user)
        links[:delete] = delete_api_workflows_path
      end
      object.workflow.user.can_administer_site? &&
        links[:feature] = feature_api_workflows_path
    end
  end

  def jobs
    object.jobs.map do |job|
      job.current_user = logged_user
      JobSerializer.new(job).serializable_hash
    end
  end

  def object_type
    instance_options[:type]
  end

  def meta
    instance_options[:meta]
  end

  def batch_meta
    meta.empty? ? "" : " (#{meta.join(' of ')})"
  end

  def user_id
    logged_user.id
  end
end

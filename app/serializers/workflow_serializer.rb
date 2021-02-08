# Workflow serializer.
class WorkflowSerializer < ApplicationSerializer
  attributes(
    :id,
    :uid,
    :name,
    :title,
    :added_by,
    :created_at,
    :created_at_date_time,
    :launched_by,
    :launched_on,
    :app_title,
    :location,
    :revision,
    :workflow_series_id,
    :version,
    :scope,
    :featured,
    :active,
    :links,
    :jobs,
    :logged_dxuser,
  )

  attribute :all_tags_list, key: :tags

  # Returns manually assigned jobs - do not confuse with object.jobs.
  attr_accessor :jobs
  attr_reader :launched_on
  attr_writer :title

  delegate :uid, to: :object

  def title
    @title || object.title
  end

  # Returns a tags list for a Workflow
  def all_tags_list
    object.workflow_series.all_tags_list
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

  # Return empty value. We need this field only for comparison during Job rendering
  def app_title
    ""
  end

  # Returns edit version.
  def version
    object.edit_version
  end

  # Returns if Workflow was marked as 'deleted'.
  def active
    object.not_deleted?
  end

  # Builds links.
  # @return [Hash] Links.
  def links
    return {} unless logged_user

    {}.tap do |links|
      links[:show] = workflow_path(object) if can_access?(object)
      links[:user] = user_path(object.user.dxuser)
      links[:space] = space_path if object.in_space?
      # POST /api/attach_to: api_attach_to_notes, discussions, answers
      links[:attach_to] = api_attach_to_notes_path
      # publish single workflow if it is not public already
      links[:publish] = publish_object unless object.public?
      # POST /api/workflows/copy  copy_api_workflows
      links[:copy] = copy_api_workflows_path
      # POST /api/run_workflow workflow single run
      links[:run_workflow] = api_run_workflow_path
      # GET /workflows/:id/batch_workflow workflow batch run
      links[:batch_run_workflow] = batch_workflow_workflow_path(object)
      # edit a single workflow
      links[:edit] = edit_workflow_path(object)
      # GET /workflows/:id/fork - fork a single workflow
      links[:fork] = fork_workflow_path(object)
      # GET cwl_export a single workflow to a cwl file
      links[:cwl_export] = cwl_export_workflow_path(object)
      # GET wdl_export a single workflow to a wdl file
      links[:wdl_export] = wdl_export_workflow_path(object)
      # POST tags with custom payload eg: set_tags_target
      links[:set_tags] = api_set_tags_path
      if object.workflow_series
        links[:set_tags_target] = "workflow-series-#{object.workflow_series.id}"
      end

      if object.owned_by_user?(object.user)
        # PUT /api/workflows/delete soft delete
        links[:delete] = delete_api_workflows_path
      end
      if object.user.can_administer_site?
        # PUT /api/workflows/feature
        links[:feature] = feature_api_workflows_path
      end
    end
  end

  delegate :scope, to: :object
end

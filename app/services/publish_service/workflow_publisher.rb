module PublishService
  class WorkflowPublisher < ::BaseService
    def initialize(workflows, context, scope)
      super(context)

      @workflows = workflows
      @scope = scope
    end

    def call
      workflows.each do |wf|
        publish(wf)
        log_event(wf)
        update_wf_series(wf)
      end
    end

    def publish(workflow)
      old_project = workflow.project
      wf_dxid = workflow.dxid

      api.call(wf_dxid, "close")
      api.call(old_project, "clone", objects: [wf_dxid], project: new_project)
      api.call(old_project, "removeObjects", objects: [wf_dxid])

      workflow.update(scope: scope, project: new_project)
    end

    private

    attr_reader :workflows, :scope

    def new_project
      @space_project ||= space.project_for_user!(context.user)
    end

    def space
      @space ||= Space.from_scope(scope)
    end

    def update_wf_series(workflow)
      series = workflow.workflow_series
      series.update(scope: scope)
    end

    def log_event(workflow)
      SpaceEventService.call(space.id, context.user_id, nil, workflow, :workflow_added)
    end
  end
end

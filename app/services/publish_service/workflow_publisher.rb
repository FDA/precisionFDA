module PublishService
  class WorkflowPublisher
    def self.call(workflows, context, scope)
      workflows.each do |workflow|
        space = Space.from_scope(scope)
        old_project = workflow.project
        project = space.project_for_user!(context.user)
        api = DNAnexusAPI.new(context.token)
        api.call(workflow.dxid, "close")
        api.call(old_project, "clone", objects: [workflow.dxid], project: project)
        api.call(old_project, "removeObjects", objects: [workflow.dxid])
        workflow.update(scope: scope, project: project)
        SpaceEventService.call(space.id, context.user_id, nil, workflow, :workflow_added)
      end
    end
  end
end

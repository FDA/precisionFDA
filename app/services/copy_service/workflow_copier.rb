class CopyService
  class WorkflowCopier
    def initialize(api:, user:, app_copier: nil)
      @api = api
      @user = user
      @app_copier = app_copier || AppCopier.new(api: api, user: user)
    end

    def copy(workflow, scope)
      new_workflow = workflow.dup
      new_workflow.scope = scope
      space = Space.from_scope(scope)
      destination_project = space.project_for_user!(user)
      api.call(workflow.project, "clone", objects: [workflow.dxid], project: destination_project)
      new_workflow.project = destination_project
      new_workflow.save!

      copy_dependencies(new_workflow, workflow, scope)
      new_workflow
    end

    private

    attr_reader :api, :user, :app_copier

    def copy_dependencies(new_workflow, workflow, scope)
      new_workflow.update_stages!(
        workflow.stages.map do |stage|
          source_app = App.find_by_uid!(stage["app_uid"])
          new_app = app_copier.copy(source_app, scope)
          stage["app_uid"] = new_app.uid
          stage
        end
      )
    end
  end
end

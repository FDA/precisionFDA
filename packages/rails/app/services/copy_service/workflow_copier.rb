class CopyService
  # Copies workflow to a destination scope.
  class WorkflowCopier
    class WorkflowCopyError < StandardError; end

    def initialize(api:, user:)
      @api = api
      @user = user
    end

    def copy(workflow, scope)
      # TODO: When moving this to Node consider creating a new workflow instead of cloning it
      new_workflow = workflow.dup
      new_workflow.scope = scope
      destination_project = Workflow.publication_project(user, scope)

      Workflow.transaction do
        # We need to be sure that no one is cloning a workflow into the same
        #   destination project at the same time.
        api.project_clone(workflow.project, destination_project, objects: [workflow.dxid])

        # Get a cloned workflow ID. Not sure about the other way to do that.
        response = api.system_find_data_objects(
          scope: { project: destination_project },
          class: "workflow",
          name: workflow.name,
        )

        new_workflow_dxid = response["results"]&.
          first&.
          fetch("id", nil)

        unless new_workflow_dxid
          raise WorkflowCopyError, "Can't fetch a new ID of the cloned workflow."
        end

        new_workflow.project = destination_project
        new_workflow.dxid = new_workflow_dxid
        new_workflow.save!

        copy_dependencies(new_workflow, workflow, scope)

        workflow_series = WorkflowSeries.create!(
          dxid: WorkflowSeries.construct_dxid(user.dxuser, new_workflow.name),
          name: new_workflow.name,
          latest_revision_workflow_id: new_workflow.id,
          user_id: user.id,
          scope: scope,
        )
        user.tag(workflow_series, with: workflow.workflow_series.tags, on: :tags)

        new_workflow.update!(workflow_series_id: workflow_series.id)
        workflow_from_api = api.workflow_describe(new_workflow.dxid)

        workflow_from_api["stages"].each_with_index do |stage, index|
          app_dxid = new_workflow["spec"]["input_spec"]["stages"][index]["app_dxid"]
          app = api.app_describe(app_dxid)
          executable = "app-#{app['name']}/#{app['version']}"

          update_payload = {
            "editVersion" => workflow_from_api["editVersion"],
            "stage" => stage["id"],
            "executable" => executable,
          }

          api.workflow_update_executable(new_workflow.dxid, update_payload)
        end
      end
      new_workflow
    end

    private

    attr_reader :api, :user

    def copy_service
      @copy_service ||= CopyService.new(api: api, user: user)
    end

    def copy_dependencies(new_workflow, workflow, scope)
      stages = workflow.stages.map do |stage|
        source_app = App.find_by!(uid: stage["app_uid"])
        new_app = copy_service.copy(source_app, scope).first

        stage["app_dxid"] = new_app.dxid
        stage["app_uid"] = new_app.uid
        stage["inputs"].map! do |input|
          if input["class"] == "file" && input["default_workflow_value"].present?
            app_input = new_app.find_input(input["name"])

            raise WorkflowCopyError, "Can't remap workflow stage inputs" unless app_input

            file_to_copy = UserFile.find_by!(uid: input["default_workflow_value"])
            copied_file = copy_service.copy(file_to_copy, scope).first

            input["default_workflow_value"] = copied_file.uid
            input["defaultValues"] = app_input["defaultValues"]
          end

          input
        end

        stage
      end

      new_workflow.update_stages!(stages)
    end
  end
end

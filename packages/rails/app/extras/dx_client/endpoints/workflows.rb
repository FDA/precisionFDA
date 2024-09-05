module DXClient
  module Endpoints
    # Contains workflows-related methods.
    module Workflows
      # Runs workflow.
      # @see https://documentation.dnanexus.com/developer/api/running-analyses/workflows-and-analyses#api-method-workflow-xxxx-run
      # @param workflow_dxid [String] Workflow to run.
      # @param project_dxid [String] Project in which workflow should be run.
      # @param input [Hash] Inputs for workflow.
      # @param opts [Hash] Additional opts.
      # @return [Hash]
      def workflow_run(workflow_dxid, project_dxid, input, opts = {})
        call(workflow_dxid, "run", opts.merge(project: project_dxid, input: input))
      end

      # Creates new workflow.
      # @see https://documentation.dnanexus.com/developer/api/running-analyses/workflows-and-analyses#api-method-workflow-new
      # @param project_dxid [String] Workflow project.
      # @param opts [Hash] Additional opts.
      # @return [Hash]
      def workflow_new(project_dxid, opts = {})
        call("workflow", "new", opts.merge(project: project_dxid))
      end

      # Describe workflow.
      # @see https://documentation.dnanexus.com/developer/api/running-analyses/workflows-and-analyses#api-method-workflow-xxxx-describe
      # @param workflow_dxid [String] Workflow to describe.
      # @param opts [Hash] Additional opts.
      # @return [Hash]
      def workflow_describe(workflow_dxid, opts = {})
        call(workflow_dxid, "describe", opts)
      end

      # Updates workflow executable.
      # @see https://documentation.dnanexus.com/developer/api/running-analyses/workflows-and-analyses#api-method-workflow-xxxx-updatestageexecutable
      # @param workflow_dxid [String] Workflow to update.
      # @param opts [Hash] body of the request containing executables that should be updated.
      def workflow_update_executable(workflow_dxid, opts = {})
        call(workflow_dxid, "updateStageExecutable", opts)
      end
    end
  end
end

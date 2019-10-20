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

      # Clones source workflow.
      # @see https://documentation.dnanexus.com/developer/api/data-containers/cloning#api-method-class-xxxx-clone
      # @param source_workflow_dxid [String] Workflow to copy objects from.
      # @param destination_workflow_dxid [String] Workflow to copy objects to.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def workflow_clone(source_workflow_dxid, destination_workflow_dxid, opts = {})
        call(source_workflow_dxid, "clone", opts.merge(project: destination_workflow_dxid))
      end
    end
  end
end

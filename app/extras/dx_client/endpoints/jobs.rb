module DXClient
  module Endpoints
    # Contains jobs-related methods.
    module Jobs
      include DXClient::Errors
      # Terminates an analysis and all of the stages' origin jobs and/or analyses.
      # https://documentation.dnanexus.com/developer/api/running-analyses/workflows-and-analyses#api-method-analysis-xxxx-terminate
      # @param job_dxid [String] Job's dxid.
      # @return [Hash]
      def job_terminate(job_dxid)
        call(job_dxid, "terminate")
      end
    end
  end
end

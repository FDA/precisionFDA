module DXClient
  module Endpoints
    # Provides jobs-related methods.
    module Jobs
      # Terminates the job.
      # @param user_dxid [String] Job dxid to terminate.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def job_terminate(job_dxid, opts = {})
        call(job_dxid, "terminate", opts)
      end
    end
  end
end

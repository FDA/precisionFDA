module DXClient
  module Endpoints
    # Provides system-related API calls.
    module System
      # Describes data objects.
      # @see https://documentation.dnanexus.com/developer/api/system-methods#api-method-system-describedataobjects
      # @param objects [Array<String>, Array<Hash>] Objects to describe.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def system_describe_data_objects(objects, opts = {})
        call("system", "describeDataObjects", opts.merge(objects: objects))
      end

      # Finds jobs.
      # @see https://documentation.dnanexus.com/developer/api/search#api-method-system-findjobs
      # @param opts [Hash] Options used to find jobs.
      # @return [Array]
      def system_find_jobs(opts = {})
        call("system", "findJobs", opts)
      end
    end
  end
end

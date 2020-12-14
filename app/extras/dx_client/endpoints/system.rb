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

      # Finds data objects.
      # @see https://documentation.dnanexus.com/developer/api/search#api-method-system-finddataobjects
      # param opts [Hash] Additional options.
      # @return [Hash] A response.
      def system_find_data_objects(opts = {})
        call("system", "findDataObjects", opts)
      end

      # Finds orgs.
      # @see https://documentation.dnanexus.com/developer/api/search#api-method-system-findorgs
      # @param opts [Hash] Options used to find orgs.
      # @return [Array]
      def system_find_orgs(opts = {})
        call("system", "findOrgs", opts)
      end

      # Finds jobs.
      # @see https://documentation.dnanexus.com/developer/api/search#api-method-system-findjobs
      # @param opts [Hash] Options used to find jobs.
      # @return [Array]
      def system_find_jobs(opts = {})
        call("system", "findJobs", opts)
      end

      # Finds projects.
      # @see https://documentation.dnanexus.com/developer/api/search#api-method-system-findprojects
      # @param opts [Hash] Options used to find projects.
      # @return [Array]
      def system_find_projects(opts = {})
        call("system", "findProjects", opts)
      end

      # Finds apps.
      # @see https://documentation.dnanexus.com/developer/api/search#api-method-system-findapps
      # @param opts [Hash] Options used to find apps.
      # @return [Array]
      def system_find_apps(opts = {})
        call("system", "findApps", opts)
      end
    end
  end
end

module DXClient
  module Endpoints
    # Provides DB clusters related methods.
    module DbClusters
      # Creates a new dbcluster in the specified project.
      # @see https://documentation.dnanexus.com/developer/api/introduction-to-data-object-classes/dbclusters#api-method-dbcluster-new
      # @param opts [Hash] Inputs. All of the following are required.
      # @option opts [String] :name A user friendly name for the database cluster
      # @option opts [String] :project The project ID that the database cluster will be created in
      # @option opts [String] :engine The database engine to use (aurora-mysql, aurora-postgresql)
      # @option opts [String] :engineVersion The version of the database engine to use.
      # @option opts [String] :dxInstanceClass The DNAnexus instance class for the database
      #   instances in this cluster.
      # @option opts [String] :adminPassword The password associated with the admin user for this
      #   cluster. Must be at least 8 characters in length.
      # @return [Hash] The result contains only the id of the created dbcluster.
      def dbcluster_new(opts)
        call("dbcluster", "new", opts)
      end

      # Describes the specified dbcluster object.
      # @see https://documentation.dnanexus.com/developer/api/introduction-to-data-object-classes/dbclusters#api-method-dbcluster-xxxx-describe
      # @param dbcluster_dxid [String] The DB Cluster dxid.
      # @param opts [Hash] Additinal inputs.
      # @return [Hash] The result contains only the id of the created dbcluster.
      def dbcluster_describe(dbcluster_dxid, opts = {})
        call(dbcluster_dxid, "describe", opts)
      end

      # Stops the specified dbcluster. The cluster must be in the 'available' status in order for
      #   this call to succeed.
      # @param dbcluster_dxid [String] The DB Cluster dxid.
      # @return [Hash] The result contains only the id of the created dbcluster.
      def dbcluster_stop(dbcluster_dxid)
        call(dbcluster_dxid, "stop")
      end

      # Restarts the specified dbcluster. Can only be called when the dbcluster is in
      #   the 'stopped' status.
      # @param dbcluster_dxid [String] The DB Cluster dxid.
      # @return [Hash] The result contains only the id of the created dbcluster.
      def dbcluster_start(dbcluster_dxid)
        call(dbcluster_dxid, "start")
      end

      # Terminates the specified dbcluster. This can only be called when the dbcluster is in the
      #   'available' status as AWS does not allow users to terminate stopped databases.
      # @param dbcluster_dxid [String] The DB Cluster dxid.
      # @return [Hash] The result contains only the id of the created dbcluster.
      def dbcluster_terminate(dbcluster_dxid)
        call(dbcluster_dxid, "terminate")
      end
    end
  end
end

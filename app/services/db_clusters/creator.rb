module DbClusters
  # The service for creating DB clusters
  class Creator < ApplicationService
    attr_reader :api, :opts

    def initialize(api, opts)
      @api = api
      @opts = opts
    end

    def call
      new_dbcluster = api.dbcluster_new(create_opts)
      described = api.dbcluster_describe(new_dbcluster[:id])
      persist!(described)
    end

    private

    def persist!(described)
      dbcluster = DbCluster.new(
        dxid: described[:id],
        name: described[:name],
        status: described[:status],
        scope: opts[:scope],
        user: opts[:user],
        project: described[:project],
        dx_instance_class: described[:dxInstanceClass],
        engine: described[:engine],
        engine_version: described[:engineVersion],
        host: described[:endpoint],
        port: described[:port],
        description: opts[:description],
        status_as_of: Time.strptime(described[:statusAsOf].to_s, "%Q"),
      )

      dbcluster.save!
      dbcluster
    end

    def create_opts
      allowed = DXClient::Endpoints::DbClusters::DB_CLUSTER_NEW_ALLOWED_PARAMS
      opts.slice(*allowed)
    end
  end
end

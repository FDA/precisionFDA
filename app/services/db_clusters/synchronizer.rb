module DbClusters
  # Responsible for synchronizing db clusters.
  class Synchronizer < ApplicationService
    attr_reader :api, :dbcluster, :opts

    def initialize(api, dbcluster, opts = { with_delete: true })
      @api = api
      @dbcluster = dbcluster
      @opts = opts
    end

    def call
      begin
        described = api.dbcluster_describe(dbcluster.dxid)
      rescue DXClient::Errors::NotFoundError
        return unless opts[:with_delete]

        dbcluster.destroy!

        Rails.logger.warn \
          I18n.t("db_clusters.synchronizer.removed_nonexisting", dxid: dbcluster.dxid)
        return
      end

      dbcluster.update!(
        status: described[:status],
        status_as_of: Time.strptime(described[:statusAsOf].to_s, "%Q"),
        host: described[:endpoint],
        port: described[:port],
      )
      dbcluster
    end
  end
end

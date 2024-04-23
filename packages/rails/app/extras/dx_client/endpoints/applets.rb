module DXClient
  module Endpoints
    # Provides applets-related methods.
    module Applets
      # Creates new applet.
      # @see https://documentation.dnanexus.com/developer/api/running-analyses/applets-and-entry-points#api-method-applet-new
      # @param project_dxid [String] Id of the project an applet should belong to.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def applet_new(project_dxid, opts)
        call("applet", "new", opts.merge(project: project_dxid))
      end

      # Describes an applet object.
      # @see https://documentation.dnanexus.com/developer/api/running-analyses/applets-and-entry-points#api-method-applet-xxxx-describe
      # @param applet_dxid [String] Applet's dxid.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def applet_describe(applet_dxid, opts = {})
        call(applet_dxid, "describe", opts)
      end
    end
  end
end

module DXClient
  module Endpoints
    # Contains apps-related methods.
    module Apps
      include DXClient::Errors
      # {"error":{"type":"InvalidInput","message":"The specified user or org (org-pfda..aleks.moroz.2)
      #   that will be responsible for charges associated with this app version does not match the one
      #   responsible for charges associated with the app (org-pfda..autotestorg1)"}}
      #
      # Create a new app
      # @see https://documentation.dnanexus.com/developer/api/running-analyses/apps#api-method-app-new
      # @param opts [Hash] Additional options.
      # @raise [DXClient::Errors::ChargesMismatchError] If response error with the charges mismatch was returned
      # @return [Hash]
      def app_new(opts = {})
        call("app", "new", opts)
      rescue => e
        charges_error = "app version does not match the one responsible for charges " \
                        "associated with the app"

        if e.message.include?(charges_error)
          raise DXClient::Errors::ChargesMismatchError,
                "You can't create a new revision from this app because the last revision was " \
                "created from the different organization that is responsible for charges. " \
                "Please create a fork instead."
        end

        raise
      end

      # Runs app.
      # @see https://documentation.dnanexus.com/developer/api/running-analyses/apps#api-method-app-xxxx-yyyy-run
      # @param app_dxid [String] App's dxid to run.
      # @param revision [String, nil] App's revision to run. Should be nil if no revision is
      #   planned to run.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def app_run(app_dxid, revision = nil, opts = {})
        full_dxid = app_dxid
        full_dxid = "#{app_dxid}/#{revision}" if revision.present?

        call(full_dxid, "run", opts)
      end

      # Adds authorized users (users and/or orgs) to the app.
      # @see https://documentation.dnanexus.com/developer/api/running-analyses/apps#api-method-app-xxxx-yyyy-addauthorizedusers
      # @param app_dxid [String] App's dxid.
      # @param authorized_users [Array<String>] List of user and/or org IDs to add to
      # the access list.
      # @return [Hash]
      def app_add_authorized_users(app_dxid, authorized_users)
        call(app_dxid, "addAuthorizedUsers", authorizedUsers: authorized_users)
      end

      # Adds developers (users and/or orgs) to the app.
      # @see https://documentation.dnanexus.com/developer/api/running-analyses/apps#api-method-app-xxxx-yyyy-adddevelopers
      # @param app_dxid [String] App's dxid.
      # @param developers [Array<String>] List of user and/or org IDs that will be
      # added as developers.
      # @return [Hash]
      def app_add_developers(app_dxid, developers)
        call(app_dxid, "addDevelopers", developers: developers)
      end
    end
  end
end

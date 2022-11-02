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
          # currently the only way to change billTo for new version in app series
          # is to create the app with previous billTo and update with new billTo
          # https://github.com/dnanexus/file-apps/blob/master/docs/App-Publishing-Checklist.md#how-to-update-apps-billto

          parsed = e.message.scan(/\(([^()]*)\)/).flatten
          current_bill_to = parsed[0].to_s
          previous_bill_to = parsed[1].to_s

          Rails.logger.info("Attempt to create app with billTo #{current_bill_to} failed, " \
                            "because previous version was created with billTo #{previous_bill_to}")
          Rails.logger.info("Creating new version with #{previous_bill_to} and updating billTo to #{current_bill_to}")

          opts[:billTo] = previous_bill_to
          res = call("app", "new", opts)

          call(res["id"], "update", { billTo: current_bill_to })
          return res
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

      # Describe the app.
      # @see https://documentation.dnanexus.com/developer/api/running-analyses/apps#api-method-app-xxxx-yyyy-describe
      # @param app_dxid [String] App's dxid.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def app_describe(app_dxid, opts = {})
        call(app_dxid, "describe", opts)
      end
    end
  end
end

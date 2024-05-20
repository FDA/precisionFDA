module DXClient
  # Provides common actions
  module Common
    extend ActiveSupport::Concern
    include Constants

    # Class methods.
    class_methods do
      def email_exists?(email)
        api = for_admin

        begin
          api.org_invite(ORG_DUMMY, email, suppressEmailNotification: true)
        rescue DXClient::Errors::NotFoundError
          return false
        end

        begin
          members = api.org_find_members(ORG_DUMMY)["results"]
          Utils.each_with_delay(members, 0.5) do |result|
            user_dxid = result["id"]
            next if result["level"] != ORG_MEMBERSHIP_MEMBER || user_dxid == ADMIN_USER

            api.org_remove_member(ORG_DUMMY, user_dxid)
          end
        rescue DXClient::Errors::DXClientError => e
          Rails.logger.error([e.message, e.backtrace.join("\n")].join("\n"))
        end

        true
      end
    end

    def entity_exists?(entity)
      call(entity.to_s, "describe")
      true
    rescue DXClient::Errors::NotFoundError
      false
    end

    # Used with auth api endpoint only.
    # Needs only for Staging and Production, works without a coed on Dev stack and Dev env
    def get_https_job_auth_token(job)
      params = {
        grant_type: "authorization_code",
        scope: { full: true },
        label: "httpsapp",
        client_id: "httpsapp",
        redirect_uri: "#{job.https_job_external_url.downcase}/oauth2/access",
      }

      call("system", "newAuthToken", params)["authorization_code"]
    end

    def generate_permanent_link(file)
      opts = {
        project: file.project,
        preauthenticated: true,
        filename: file.name,
        duration: 9_999_999_999,
      }
      call(file.dxid, "download", opts)["url"]
    end

    def org_exists?(orgname)
      call("org-#{orgname}", "describe")
      true
    rescue DXClient::Errors::NotFoundError
      false
    end

    def user_exists?(username)
      call("user-#{username}", "describe")
      true
    rescue DXClient::Errors::NotFoundError
      false
    end

    # Gets user's charges.
    # @param user [User] User for whom we get charges.
    # @return [ActiveSupport::HashWithIndifferentAccess] User's charges hash.
    def user_charges(user)
      org_describe(user.org.dxid).slice(:computeCharges, :storageCharges, :dataEgressCharges)
    end
  end
end

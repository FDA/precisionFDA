module Admin
  # Responsible for users related actions.
  class UsersController < BaseController
    skip_before_action  :check_admin, only: :toggle_activate_user
    layout "react", only: %i(index)

    # GET
    # Renders users.
    def index
      response = https_apps_client.users_list(
        unsafe_params[:page],
        unsafe_params[:per_page],
        unsafe_params[:order_by],
        unsafe_params[:order_dir],
        unsafe_params[:filters],
      )
      # render json: response, adapter: :json
      respond_to do |format|
        format.html { render "admin/users/index" }
        format.json { render json: response }
      end
    end

    # TODO(samuel) unify this method
    # POST
    # Toggles user's active status.
    def toggle_activate_user
      user = User.find_by(dxuser: unsafe_params[:dxuser])

      if !current_user.can_administer_site? && !user_org_admin?(user)
        redirect_to root_path && return
      end

      if user == current_user
        redirect_back(fallback_location: user_path(user), alert: "Cannot disable self.") && return
      end

      state = unsafe_params[:state]

      case user.user_state
      when "enabled"
        state = "deactivated"
        user.disable_message = unsafe_params[:message]
        user.email = Base64.encode64(user.email).sub("\n", "") + DNANEXUS_INVALID_EMAIL

        user.normalized_email = Base64.
          encode64(user.normalized_email).sub("\n", "") + DNANEXUS_INVALID_EMAIL

      when "deactivated"
        if state != ""
          state = "enabled"
          user.disable_message = nil
          user.email = Base64.decode64(user.email.sub(DNANEXUS_INVALID_EMAIL, "\n"))

          user.normalized_email = Base64.decode64(
            user.normalized_email.sub(DNANEXUS_INVALID_EMAIL, "\n"),
          )
        end
      end

      if state.present? && user.valid?
        user.user_state = state
        user.save!(validate: false)
        redirect_back(
          fallback_location: user_path(user),
          alert: "User has been #{state == 'enabled' ? 're-activated' : 'de-activated'}",
        )
      else
        errors = user.errors.map { |_k, v| v }.join(",\n")

        redirect_back(
          fallback_location: user_path(user),
          error: "There was an error locking the user: #{errors}",
        )
      end
    end

    # ┌───────────────────────────────────────────────────────────┐
    # │                                                           │
    # │   Bulk methods implemented in https-apps-api begin here   │
    # │                                                           │
    # └───────────────────────────────────────────────────────────┘

    def set_total_limit
      response = https_apps_client.users_set_total_limit(
        unsafe_params[:ids],
        unsafe_params[:totalLimit],
      )
      respond_to do |format|
        format.json { render json: response }
      end
    end

    def set_job_limit
      response = https_apps_client.users_set_job_limit(
        unsafe_params[:ids],
        unsafe_params[:jobLimit],
      )
      respond_to do |format|
        format.json { render json: response }
      end
    end

    def bulk_reset_2fa
      response = https_apps_client.users_reset_2fa(
        unsafe_params[:ids],
      )
      respond_to do |format|
        format.json { render json: response }
      end
    end

    def bulk_unlock
      response = https_apps_client.users_unlock(
        unsafe_params[:ids],
      )
      respond_to do |format|
        format.json { render json: response }
      end
    end

    def bulk_activate
      response = https_apps_client.users_activate(
        unsafe_params[:ids],
      )
      respond_to do |format|
        format.json { render json: response }
      end
    end

    def bulk_deactivate
      response = https_apps_client.users_deactivate(
        unsafe_params[:ids],
      )
      respond_to do |format|
        format.json { render json: response }
      end
    end

    def bulk_enable_resource
      response = https_apps_client.users_enable_resource(
        unsafe_params[:ids],
        unsafe_params[:resource],
      )
      respond_to do |format|
        format.json { render json: response }
      end
    end

    def bulk_enable_all_resources
      response = https_apps_client.users_enable_all_resources(unsafe_params[:ids])
      respond_to do |format|
        format.json { render json: response }
      end
    end

    def bulk_disable_resource
      response = https_apps_client.users_disable_resource(
        unsafe_params[:ids],
        unsafe_params[:resource],
      )
      respond_to do |format|
        format.json { render json: response }
      end
    end

    def bulk_disable_all_resources
      response = https_apps_client.users_disable_all_resources(unsafe_params[:ids])
      respond_to do |format|
        format.json { render json: response }
      end
    end

    # ┌───────────────────────────────────────────────────────┐
    # │                                                       │
    # │  Bulk methods implemented in https-apps-api end here  │
    # │                                                       │
    # └───────────────────────────────────────────────────────┘

    # GET
    # Renders deactivated users.
    def deactivated_users
      @users = User.deactivated
      @users_grid = initialize_grid(@users)

      respond_to do |format|
        format.html { render "admin/users/deactivated" }
        format.json { render json: { users: @users } }
      end
    end

    # GET
    # Renders pending users.
    def pending_users
      @users = User.where(private_files_project: nil)

      @users_grid = initialize_grid(@users)
      render "admin/users/pending"
    end

    # POST
    # Sends activation email.
    def resend_activation_email
      user = User.find_by(dxuser: unsafe_params[:dxuser])

      begin
        api = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
        api.call("account", "resendActivationEmail", usernameOrEmail: user.dxid)
      rescue DXClient::Errors::DXClientError
        redirect_back(fallback_location: user_path(user), error: "There was a platform error")
      else
        redirect_back(
          fallback_location: user_path(user),
          success: "Activation email has been resent",
        )
      end
    end

    # POST
    # Resets 2FA.
    def reset_2fa
      user = User.find_by(dxuser: unsafe_params[:dxuser])

      begin
        api = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
        api.call(user.dxid, "resetUserMFA", user_id: user.dxid, org_id: ORG_EVERYONE)
      rescue DXClient::Errors::DXClientError => e
        if e.message =~ /MFA is already reset/
          redirect_back(
            fallback_location: user_path(user),
            alert: "MFA is already reset or not yet configured for the user",
          )
        else
          redirect_back(
            fallback_location: user_path(user),
            alert: "There was a server error, please try again",
          )
        end
      else
        redirect_back(fallback_location: user_path(user), alert: "Reset successfully")
      end
    end

    # POST
    # Unlocks user.
    def unlock_user
      user = User.find_by(dxuser: unsafe_params[:dxuser])

      begin
        api = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
        api.call(
          @context.user.dxid,
          "unlockUserAccount",
          user_id: user.dxid,
          org_id: ORG_EVERYONE,
        )
      rescue DXClient::Errors::DXClientError => e
        if request.post?
          render json: { ok: "error" }, status: :forbidden
        else
          error = "There was an error, please try again later."
          error = "permission denied, must be a user of the org." if e.message =~ /must be an admin/

          redirect_back(fallback_location: user_path(user), alert: error)
        end
      else
        redirect_back(fallback_location: user_path(user), alert: "User has been unlocked")
      end
    end

    # GET
    # Exports active users to CSV.
    def active
      date_string = Time.zone.now.strftime("%Y-%m-%d")
      csv_data = UsersCsvExporter.export_active_users

      send_data csv_data,
                disposition: "attachment",
                filename: "active_users_#{date_string}.csv",
                type: "text/csv"
    end

    private

    # Checks if current user is organization admin.
    # @param user [User] User to check.
    # @return [Boolean] Returns true if current user is organization admin, false otherwise.
    def user_org_admin?(user)
      current_user.id == user.org.admin_id
    end

    # TODO(samuel) ask about better way to implement this
    def https_apps_client
      DIContainer.resolve("https_apps_client")
    end
  end
end

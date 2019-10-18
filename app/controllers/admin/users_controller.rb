module Admin
  class UsersController < BaseController
    skip_before_action  :check_admin, only: :toggle_activate_user

    def index
      @users = User.all
      @users_grid = initialize_grid(@users)
    end

    def toggle_activate_user
      user = User.find_by_dxuser(unsafe_params[:dxuser])

      if !current_user.can_administer_site? && !user_org_admin?(user)
         redirect_to root_path and return
      end

      if user == current_user
        redirect_back(fallback_location: user_path(user), alert: "Cannot disable self.") and return
      end

      state = unsafe_params[:state]

      case user.user_state
      when "enabled"
        state = "deactivated"
        user.disable_message = unsafe_params[:message]
        user.email = Base64.encode64(user.email).sub("\n","") + DNANEXUS_INVALID_EMAIL
        user.normalized_email = Base64.encode64(user.normalized_email).sub("\n","") + DNANEXUS_INVALID_EMAIL

      when "deactivated"
        if state != ''
          state = "enabled"
          user.disable_message = nil
          user.email = Base64.decode64(user.email.sub(DNANEXUS_INVALID_EMAIL, "\n"))
          user.normalized_email = Base64.decode64(user.normalized_email.sub(DNANEXUS_INVALID_EMAIL, "\n"))
        end
      end

      if state.present? && user.valid?
        user.user_state = state
        user.save!(validate: false)
        redirect_back(
          fallback_location: user_path(user),
          alert: "User has been #{state == 'enabled' ? 're-activated':'de-activated'}"
        )
      else
        redirect_back(
          fallback_location: user_path(user),
          error: "There was an error locking the user: #{ user.errors.map{|k,v| v }.join(",\n") }"
        )
      end
    end

    def deactivated_users
      @users = User.deactivated
      @users_grid = initialize_grid(@users)

      respond_to do |format|
       format.html { render 'admin/users/deactivated' }
       format.json { render json: { users: @users } }
      end
    end

    def pending_users
      @users = User.where(private_files_project: nil)

      @users_grid = initialize_grid(@users)
      render 'admin/users/pending'
    end

    def resend_activation_email
      if @context.user.can_administer_site?
        user = User.find_by_dxuser(unsafe_params[:dxuser])

        begin
          api = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
          result = api.call(
              'account',
             "resendActivationEmail",
              usernameOrEmail: user.dxid
            )
        rescue Net::HTTPServerException => e
          redirect_back(fallback_location: user_path(user), error: "There was a platform error")
        else
          redirect_back(
            fallback_location: user_path(user),
            success: "Activation email has been resent"
          )
        end
      end
    end

    def reset_2fa
      if @context.user.can_administer_site?
        user = User.find_by_dxuser(unsafe_params[:dxuser])
        begin
          api = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
          result = api.call(
            user.dxid,
           "resetUserMFA",
            user_id: user.dxid,
            org_id: ORG_EVERYONE
          )
        rescue Net::HTTPServerException => e
          if e.message =~ /MFA is already reset/
            redirect_back(
              fallback_location: user_path(user),
              alert: "MFA is already reset or not yet configured for the user"
            )
          else
            redirect_back(
              fallback_location: user_path(user),
              alert: "There was a server error, please try again"
            )
          end
        else
          redirect_back(fallback_location: user_path(user), alert: "Reset successfully")
        end
      end
    end

    def unlock_user
        user = User.find_by_dxuser(unsafe_params[:dxuser])
        begin
          api = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
          result = api.call(
              @context.user.dxid,
              "unlockUserAccount",
              user_id: user.dxid,
              org_id: ORG_EVERYONE
          )
        rescue Net::HTTPServerException => e
          if request.method == 'POST'
            render json: { ok: 'error' }, status: 403
          else
            error = "There was an error, please try again later."
            if e.message =~ /must be an admin/
              error = "permission denied, must be a user of the org."
            end
            redirect_back(fallback_location: user_path(user), alert: error)
          end
        else
          redirect_back(fallback_location: user_path(user), alert: "User has been unlocked")
        end
    end

    def active
      date_string = Time.now.strftime("%Y-%m-%d")
      csv_data = UsersCsvExporter.export_active_users

      send_data csv_data,
                disposition: "attachment",
                filename: "active_users_#{date_string}.csv",
                type: "text/csv"
    end

    def edit
      # 1. get information from dnanexusAPI
      # 2. set information to dnanexusAUTH server

      @user = User.find_by_dxuser(unsafe_params[:dxuser])
    end

    def update
      @user = User.find_by_dxuser(unsafe_params[:dxuser])
    end

    def all_users
      query = ['%' + unsafe_params["search"] + '%']
      org = unsafe_params[:org]
      org = Org.find_by_handle(org) rescue nil
      org_id = org.id rescue nil
      render json: { users: User.where("(dxuser like ? or first_name like ? or last_name like ?) and org_id = ? and id <> ?", *(query * 3),org_id, org.admin.id).limit(20) }
    end

    def user_org_admin?(user)
      current_user.id == user.org.admin_id
    end
  end
end

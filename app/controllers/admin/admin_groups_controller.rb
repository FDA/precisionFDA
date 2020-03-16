module Admin
  class AdminGroupsController < BaseController

    before_action :init_admin_group
    skip_before_action  :check_admin

    def index
      @members_grid = initialize_grid(@admin_group.users, {
          name: 'Admins',
          order: 'name',
          order_direction: 'asc',
          per_page: 25
      })
      render :list
    end

    def new_admin
      @users = User.all
      @users_grid = initialize_grid(@users)
    end

    def provision
byebug
      user = User.find_by_dxuser(unsafe_params[:dxuser])

      if !current_user.can_administer_site?
        redirect_to root_path and return
      end

      if user == current_user
        redirect_back(fallback_location: user_path(user), alert: "Cannot add self.") and return
      end

      role = unsafe_params[:group]

      case role
        when "site"
          membership = AdminMembership.create!(admin_group_id: @admin_group.id, user_id: user.id)
          add_user_to_org(user.dxuser)

        when "space", "challenge_admin", "challenge_eval"
          membership = AdminMembership.create!(admin_group_id: @admin_group.id, user_id: user.id)
      end

      if membership.present?
        redirect_back(
            fallback_location: admin_admin_groups_path(:group => role),
            alert: "User has been added"
        )
      else
        redirect_back(
            fallback_location: admin_admin_groups_path(:group => role),
            error: "There was an adding user"
        )
      end
    end

    def list_admin_users
      @users = User.deactivated
      @users_grid = initialize_grid(@users)

      respond_to do |format|
        format.html { render 'admin/users/deactivated' }
        format.json { render json: { users: @users } }
      end
    end

    def send_invite_email
      if @context.user.can_administer_site?
        user = User.find_by_dxuser(unsafe_params[:dxuser])

        begin
          api = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
          result = api.call(
              'account',
              "resendActivationEmail",
              usernameOrEmail: user.dxid
          )
        rescue Net::HTTPClientException => e
          redirect_back(fallback_location: user_path(user), error: "There was a platform error")
        else
          redirect_back(
              fallback_location: user_path(user),
              success: "Activation email has been resent"
          )
        end
      end
    end

    def edit
      # 1. get information from dnanexusAPI
      # 2. set information to dnanexusAUTH server

      @user = User.find_by_dxuser(unsafe_params[:dxuser])
    end

    def update
      @user = User.find_by_dxuser(unsafe_params[:dxuser])
    end

    # Selects all users, according search string for the given org.
    # Users selected are not in 'pending' state.
    # @param search [String] - search string
    # @param org [String] - org handle string
    # @return users [Array of User objects] - an array of users, searched by search string match.
    def all_users
      users = User.org_members(params[:search], params[:org])

      render json: { users: users }
    end

    private

    def init_admin_group
      @admin_group = AdminGroup.find_by(role: params[:group])
    end

    def add_user_to_org(dxuser)
      admin_member_processor = DIContainer.resolve("orgs.admin_member_provisioner")
      admin_member_processor.call(dxuser)
    end
  end
end

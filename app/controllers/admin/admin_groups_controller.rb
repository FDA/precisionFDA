module Admin
  # Responsible for maintaining admin groups actions.
  class AdminGroupsController < BaseController
    before_action :init_admin_group

    def index
      @members_grid = initialize_grid(@admin_group.users,
                                      name: "Admins",
                                        order: "name",
                                        order_direction: "asc",
                                        per_page: 25)
      render :list
    end

    def new_admin
      @users = User.all
      @users_grid = initialize_grid(@users)
    end

    def provision
      user = User.find(unsafe_params[:user_id])

      redirect_to(root_path) && return unless current_user.can_administer_site?

      group = unsafe_params[:group]

      membership = AdminMembership.
        find_or_create_by!(admin_group_id: @admin_group.id, user_id: user.id)

      add_user_to_org(user.dxuser) if group == "site"

      if membership.present?
        redirect_back(
          fallback_location: admin_admin_groups_path(group: group),
          alert: "User has been added",
        )
      else
        redirect_back(
          fallback_location: admin_admin_groups_path(group: group),
          error: "There was an adding user",
        )
      end
    end

    def destroy
      @user = User.find(unsafe_params[:id])
      membership = AdminMembership.where(user: @user, admin_group: @admin_group).first
      if membership.destroy!
        redirect_back(
          fallback_location: admin_admin_groups_path(group: params[:group]),
            alert: "User has been removed",
        )
      else
        redirect_back(
          fallback_location: admin_admin_groups_path(group: params[:group]),
          success: "User could not be removed",
        )
      end
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

module Admin
  # Responsible for maintaining admin membership actions.
  class AdminMembershipsController < BaseController
    before_action :init_role, only: %i(index)

    def index
      Rails.logger.info params[:group]

      memberships = AdminMembership.joins(:admin_group).
        includes(:user).
        where(admin_groups: { role: params[:group] })

      @memberships_grid = initialize_grid(
        memberships,
        name: "Admins",
        order: "user.dxuser",
        per_page: 25,
      )
    end

    def new
      users = User.includes(:admin_groups)

      @users_grid = initialize_grid(
        users,
        order: "dxuser",
        per_page: 25,
      )
    end

    def create
      user = User.find(params[:user_id])
      admin_group = AdminGroup.find_by(role: params[:group])

      membership = AdminMembership.
        find_or_initialize_by(admin_group: admin_group, user: user)

      add_user_to_org(user.dxuser) if admin_group.site?

      fallback_location = admin_admin_memberships_path(group: admin_group.role)

      if membership.persisted?
        flash[:error] = "User is already a #{admin_group.role.titleize} admin"
      elsif membership.save
        flash[:alert] = "User has been added"
      else
        flash[:error] = "Couldn't provision a new #{admin_group.role.titleize} admin"
      end

      redirect_back(fallback_location: fallback_location)
    end

    def destroy
      membership = AdminMembership.find(params[:id])

      if membership.destroy
        flash[:alert] = "User has been removed"
      else
        flash[:error] = "User couldn't be removed"
      end

      fallback_location = admin_admin_memberships_path(group: membership.admin_group.role)

      redirect_back(fallback_location: fallback_location)
    end

    private

    def init_role
      params[:group] = (AdminGroup.roles.keys & Array(params[:group])).first ||
                        AdminGroup::ROLE_SITE_ADMIN
    end

    def add_user_to_org(dxuser)
      admin_member_processor = DIContainer.resolve("orgs.admin_member_provisioner")
      admin_member_processor.call(dxuser)
    end
  end
end

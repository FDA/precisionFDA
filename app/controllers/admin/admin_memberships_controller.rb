module Admin
  # Responsible for maintaining admin membership actions.
  class AdminMembershipsController < BaseController
    before_action :init_role, only: %i(index)

    def index
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
      users = User.real.enabled.includes(:admin_groups)

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

      fallback_location = admin_admin_memberships_path(group: admin_group.role)

      if membership.persisted?
        flash[:error] = "User is already a #{admin_group.role.titleize} admin!"
        redirect_back(fallback_location: fallback_location) && return
      end

      membership.transaction do
        membership.save!
        add_user_to_org(user.dxid) if admin_group.site?
        flash[:alert] = "User has been added."
      rescue StandardError
        flash[:error] = "Couldn't provision a new #{admin_group.role.titleize} admin!"
        raise ActiveRecord::Rollback
      end

      redirect_back(fallback_location: fallback_location)
    end

    def destroy
      membership = AdminMembership.find(params[:id])

      membership.transaction do
        membership.destroy!
        remove_user_from_org(membership.user.dxid) if membership.site?
        flash[:alert] = "User has been removed."
      rescue StandardError
        flash[:error] = "User couldn't be removed!"
        raise ActiveRecord::Rollback
      end

      fallback_location = admin_admin_memberships_path(group: membership.role)

      redirect_back(fallback_location: fallback_location)
    end

    private

    # Sets admin group role.
    # returns [String] Admin group role.
    def init_role
      params[:group] = (AdminGroup.roles.keys & Array(params[:group])).first ||
                       AdminGroup::ROLE_SITE_ADMIN
    end

    # Removes a user from the site admins organization.
    def remove_user_from_org(dxid)
      api = DIContainer.resolve("api.admin")

      api.org_remove_member(PFDA_ADMIN_ORG, dxid)
    end

    # Adds a user to the site admins organization.
    def add_user_to_org(dxid)
      admin_member_processor = DIContainer.resolve("orgs.admin_member_provisioner")
      admin_member_processor.call(dxid)
    end
  end
end

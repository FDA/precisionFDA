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
        add_to_admin_spaces(user) if admin_group.site?
        flash[:alert] = "User #{user.dxuser} has been added."
      rescue StandardError => e
        flash[:error] = "Couldn't provision a new #{admin_group.role.titleize} admin!"
        Rails.logger.error(e.message)
        raise ActiveRecord::Rollback
      end

      redirect_back(fallback_location: fallback_location)
    end

    def destroy
      membership = AdminMembership.find(params[:id])

      membership.transaction do
        membership.destroy!
        remove_user_from_org(membership.user.dxid) if membership.site?
        remove_from_admin_spaces(membership.user) if membership.site?
        flash[:alert] = "User #{membership.user.dxuser} has been removed from admin group #{membership.admin_group_id}."
      rescue StandardError => e
        flash[:error] = "User #{membership.user.dxuser} couldn't be removed!"
        Rails.logger.error(e.message)
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
      result = admin_member_processor.call(dxid)
      logger.info("AdminMembershipsController: Site admin org invite API call result: #{result}")
      result
    end

    # Adding new site admin to all existing Administrator Spaces
    def add_to_admin_spaces(user)
      api = DIContainer.resolve("api.user")

      Space.admin_spaces.each do |space|
        logger.info("Adding site admin #{user.dxuser} to admin space #{space.id}")
        admin_membership = space.space_memberships.find_by(user: space.host_lead)

        membership = space.space_memberships.active.where(user_id: user.id).first_or_initialize
        membership.attributes = { role: SpaceMembership::ROLE_ADMIN, side: admin_membership.side }

        logger.info("AdminMembershipsController: Org invite API call using api.user, org: #{space.host_dxorg}, user: #{user.dxid}")

        result = api.org_invite(
          space.host_dxorg,
          user.dxid,
          level: DNAnexusAPI::ORG_MEMBERSHIP_ADMIN,
          suppressEmailNotification: true,
        )

        logger.info("AdminMembershipsController: Org invite API call result #{result}")

        project_dxid = space.host_project
        logger.info("AdminMembershipsController: Project invite API call using api.user, project: #{project_dxid}, org: #{Setting.review_app_developers_org}")

        result2 = api.project_invite(
          project_dxid,
          Setting.review_app_developers_org,
          DNAnexusAPI::PROJECT_ACCESS_CONTRIBUTE,
          suppressEmailNotification: true,
          suppressAllNotifications: true,
        )

        logger.info("AdminMembershipsController: Project invite API call result #{result2}")

        space.space_memberships << membership
        space.save!
      end
    end

    # Removing site admin from all existing Administrator Spaces
    def remove_from_admin_spaces(user)
      admin_api = DIContainer.resolve("api.admin")
      user_api = DIContainer.resolve("api.user")

      Space.admin_spaces.each do |space|
        logger.info("Removing site admin #{user.dxuser} from admin space #{space.id}")
        user_membership = space.space_memberships.find_by(user: user)
        admin_membership = space.space_memberships.find_by(user: space.host_lead)

        SpaceMembershipService::Delete.call(admin_api, user_api, space, user_membership, admin_membership)
      end
    end
  end
end

module SpaceService
  module ProjectBuilders
    class ReviewSpace < GroupSpace
      def create(space, admin)
        if admin.host?
          space.confidential_reviewer_space.space_memberships << admin
          return
        end

        super
        create_private_project(space, admin)
      end

      private

      def create_private_project(shared_space, admin)
        space = shared_space.confidential_spaces.create!(
          name: shared_space.name,
          description: shared_space.description,
          space_type: shared_space.space_type,
          cts: shared_space.cts,
          state: shared_space.state,
        )

        contribute_org = shared_space.org_dxid(admin)
        space.set_org_dxid(admin, contribute_org)

        project_dxid = api.project_new(
          "precisionfda-space-#{space.id}-#{admin.side.upcase}-PRIVATE",
          billTo: admin.user.billto,
        )["id"]

        space.set_project_dxid(admin, project_dxid)
        space.save!

        api.project_invite(
          project_dxid,
          contribute_org,
          DNAnexusAPI::PROJECT_ACCESS_CONTRIBUTE,
          suppressEmailNotification: true,
          suppressAllNotifications: true,
        )

        space.space_memberships << admin
      end
    end
  end
end

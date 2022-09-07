module SpaceService
  module ProjectBuilders
    class GroupSpace
      def initialize(api)
        @api = api
      end

      def create(space, admin)
        return if space.project_dxid(admin).present?

        contribute_org = space.org_dxid(admin)
        opposite_org = space.opposite_org_dxid(admin)
        project_dxid = create_project(admin, space)

        invite_member(project_dxid, contribute_org)
        invite_member(project_dxid, opposite_org)

        level = admin.host? ? "CONTRIBUTE" : "VIEW"
        invite_member(project_dxid, Setting.review_app_developers_org, level)
        space.set_project_dxid(admin, project_dxid)
      end

      private

      attr_reader :api

      def create_project(admin, space)
        api.call(
          "project", "new",
          name: "precisionfda-space-#{space.id}-#{admin.side.upcase}",
          billTo: admin.user.billto,
        )["id"]
      end

      def invite_member(project_dxid, contribute_org, level = "CONTRIBUTE")
        api.call(
          project_dxid, "invite",
          invitee: contribute_org,
          level: level,
          suppressEmailNotification: true,
          suppressAllNotifications: true
        )
      end
    end
  end
end

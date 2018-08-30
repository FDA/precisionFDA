module SpaceService
  class Accept
    class GroupSpaceProjectCreator

      def initialize(api)
        @api = api
      end

      def create(space, admin)
        return if space.project_dxid(admin).present?

        contribute_org = space.org_dxid(admin)
        view_org = space.opposite_org_dxid(admin)

        project_dxid = api.call(
          "project", "new",
          name: "precisionfda-space-#{space.id}-#{admin.side.upcase}",
          billTo: admin.user.billto,
        )["id"]

        api.call(
          project_dxid, "invite",
          invitee: contribute_org,
          level: "CONTRIBUTE",
          suppressEmailNotification: true,
          suppressAllNotifications: true
        )
        api.call(
          project_dxid, "invite",
          invitee: view_org,
          level: "VIEW",
          suppressEmailNotification: true,
          suppressAllNotifications: true
        )

        space.set_project_dxid(admin, project_dxid)
      end

      private

      attr_reader :api
    end
  end
end

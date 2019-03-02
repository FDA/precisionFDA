module SpaceService
  class Accept
    class GroupSpaceProjectCreator

      def initialize(api, context)
        @api = api
        @context = context
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
          level: "CONTRIBUTE",
          suppressEmailNotification: true,
          suppressAllNotifications: true
        )

        if space.verification?
          level = 'CONTRIBUTE'
        else
          level =  admin.host? ? "CONTRIBUTE" : "VIEW"
        end

        api.call(
          project_dxid, "invite",
          invitee: Setting.review_app_developers_org,
          level: level,
          suppressEmailNotification: true,
          suppressAllNotifications: true,
        )

        space.set_project_dxid(admin, project_dxid)
      end

      private

      attr_reader :api
    end
  end
end

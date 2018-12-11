module SpaceService
  class Accept
    class ReviewSpaceProjectCreator < GroupSpaceProjectCreator

      def create(space, admin)
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
          restrict_to_template: shared_space.restrict_to_template
        )

        contribute_org = shared_space.org_dxid(admin)
        space.set_org_dxid(admin, contribute_org)

        project_dxid = api.call(
          "project", "new",
          name: "precisionfda-space-#{space.id}-#{admin.side.upcase}-PRIVATE",
          billTo: admin.user.billto,
        )["id"]

        space.set_project_dxid(admin, project_dxid)
        space.save!

        api.call(
          project_dxid, "invite",
          invitee: contribute_org,
          level: "CONTRIBUTE",
          suppressEmailNotification: true,
          suppressAllNotifications: true,
        )

        if admin.host?
          api.call(
            project_dxid, "invite",
            invitee: Setting.review_app_developers_org,
            level: "CONTRIBUTE",
            suppressEmailNotification: true,
            suppressAllNotifications: true,
          )
        end

        space.space_memberships << admin

        apply_space_template(space) if admin.host?
      end

      def apply_space_template(space)
        parent_space = space.space
        template = parent_space.space_template

        if template.present?
          template.space_template_nodes.each do |n|
            case n.node
            when UserFile
              copy_service.copy(n.node, space.uid)
            when App
              copy_service.copy(n.node, space.uid)
            else
              raise("Space template #{template.id} has Unexpected node #{n.id} of #{n.node.class.to_s} class")
            end
          end
        end

      end

      def copy_service
        @copy_service ||= CopyService.new(api: @context.api, user: @context.user)
      end
    end
  end
end

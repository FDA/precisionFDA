module SpaceService
  module ProjectBuilders
    class VerificationSpace < GroupSpace
      def create(space, admin)
        return if space.project_dxid(admin).present?
        org_dxs = [space.host_dxorg, space.guest_dxorg, Setting.review_app_developers_org].uniq.compact
        project_dxid = create_project(admin, space)
        org_dxs.each { |dxorg| invite_member(project_dxid, dxorg) }
        space.set_project_dxid(admin, project_dxid)
      end
    end
  end
end

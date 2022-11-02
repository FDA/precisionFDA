module SpaceService
  class Delete
    # @param [SpaceMembership] admin_member
    def self.call(space, admin_member)
      space.deleted!
      space.confidential_spaces.each(&:deleted!)

      delete_files(space)
      # delete_memberships(space)

      SpaceEventService.call(space.id, admin_member.user_id, admin_member, space, :space_deleted)
    end

    def self.delete_files(space)
      scopes = space.confidential_spaces.map(&:uid)
      scopes << space.uid

      files = UserFile.where(scope: scopes)
      remove_objects_from_platform(files)
      files.destroy_all
    end

    def self.delete_memberships(space)
      # TODO: fill in stub
    end

    def self.remove_objects_from_platform(files)
      api = DNAnexusAPI.for_admin
      projects = {}
      files.uniq.each do |file|
        projects[file.project] ||= []
        projects[file.project].push(file)
      end

      projects.each do |project, project_files|
        begin
          api.call(project, "removeObjects", objects: project_files.map(&:dxid))
        rescue DXClient::Errors::NotFoundError
          # do nothing
        end
      end
    end
  end
end

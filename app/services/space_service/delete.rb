module SpaceService
  class Delete
    # @param [SpaceMembership] admin_member
    def self.call(space, admin_member)
      space.deleted!
      space.confidential_spaces.each(&:deleted!)

      delete_files(space)

      SpaceEventService.call(space.id, admin_member.user_id, admin_member, space, :space_deleted)
    end

    def self.delete_files(space)
      scopes = space.confidential_spaces.map(&:uid)
      scopes << space.uid

      files = UserFile.where(scope: scopes)
      remove_objects_from_platform(files)
      files.destroy_all
    end

    def self.remove_objects_from_platform(files)
      api = DNAnexusAPI.for_admin
      projects = {}
      files.uniq.each do |file|
        projects[file.project] = [] unless projects.has_key?(file.project)
        projects[file.project].push(file)
      end

      projects.each do |project, project_files|
        begin
          api.call(project, "removeObjects", objects: project_files.map(&:dxid))
        rescue Net::HTTPServerException => e
          raise e unless e.message =~ /^404/
        end
      end
    end
  end
end

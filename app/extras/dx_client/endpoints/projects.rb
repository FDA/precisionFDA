module DXClient
  module Endpoints
    # Provides projects-related methods.
    module Projects
      # Clones source project.
      # @see https://documentation.dnanexus.com/developer/api/data-containers/cloning#api-method-class-xxxx-clone
      # @param source_project_dxid [String] Project to copy objects from.
      # @param destination_project_dxid [String] Project to copy objects to.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def project_clone(source_project_dxid, destination_project_dxid, opts = {})
        call(source_project_dxid, "clone", opts.merge(project: destination_project_dxid))
      end

      # Updates provided project.
      # @see https://documentation.dnanexus.com/developer/api/data-containers/projects#api-method-project-xxxx-update
      # @param project_dxid [String] Project to update.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def project_update(project_dxid, opts = {})
        call(project_dxid, "update", opts)
      end

      # Creates new project.
      # @see https://documentation.dnanexus.com/developer/api/data-containers/projects#api-method-project-new
      # @param name [String] Project's name.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def project_new(name, opts = {})
        call("project", "new", opts.merge(name: name))
      end

      # Invite org or user in project.
      # @see https://documentation.dnanexus.com/developer/api/data-containers/project-permissions-and-sharing#api-method-project-xxxx-invite
      # @param invitee [String] OrgID, UserID or user's email.
      # @param level [String] Permission level.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def project_invite(project_dxid, invitee, level, opts = {})
        call(project_dxid, "invite", opts.merge(invitee: invitee, level: level))
      end

      # Destroys project.
      # @see https://documentation.dnanexus.com/developer/api/data-containers/projects#api-method-project-xxxx-destroy
      # @param project_dxid [String] Project to destroy.
      # @param opts [Hash] Additional opts.
      # @return [Hash]
      def project_destroy(project_dxid, opts = {})
        call(project_dxid, "destroy", opts)
      end

      # Describes project.
      # @see https://documentation.dnanexus.com/developer/api/data-containers/projects#api-method-project-xxxx-describe
      # @param project_dxid [String] Project to describe.
      # @param opts [Hash] Additional opts.
      # @return [Hash]
      def project_describe(project_dxid, opts = {})
        call(project_dxid, "describe", opts)
      end
    end
  end
end

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

      # Remove user from project. Call using user_api as the user leaving is implied by the token
      # @see https://documentation.dnanexus.com/developer/api/data-containers/project-permissions-and-sharing#api-method-project-xxxx-leave
      # @return [Hash]
      def project_leave(project_dxid, opts = {})
        call(project_dxid, "leave", opts)
      end

      # Decreases user permissions from provided project.
      # @see https://documentation.dnanexus.com/developer/api/data-containers/project-permissions-and-sharing#api-method-project-xxxx-decreasepermissions
      # @param project_dxid [String] Projects's dxid.
      # @param level [String] level of permission
      # @param user_dxid [String] User's dxid.
      # @return [Hash]
      def project_decrease_permissions(project_dxid, level, user_dxid)
        call(project_dxid, "decreasePermissions", user_dxid => level)
      end

      # Invite another account to take over the billing for the project.
      # @see https://documentation.dnanexus.com/developer/api/data-containers/project-permissions-and-sharing#api-method-project-xxxx-transfer
      # @param project_dxid [String] Project to transfer.
      # @param invitee [String] UserID or user's email.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def project_transfer(project_dxid, invitee, opts = {})
        call(project_dxid, "transfer", opts.merge(invitee: invitee))
      end

      # Accept billing responsibility for the project, possibly on behalf of an org.
      # @see https://documentation.dnanexus.com/developer/api/data-containers/project-permissions-and-sharing#api-method-project-xxxx-accepttransfer
      # @param project_dxid [String] Project to accept transfer.
      # @param bill_to [String] billing account (user or org ID).
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def project_accept_transfer(project_dxid, bill_to, opts = {})
        call(project_dxid, "acceptTransfer", opts.merge(billTo: bill_to))
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

      # Removes specified objects from project.
      # @see https://documentation.dnanexus.com/developer/api/data-containers/folders-and-deletion#api-method-class-xxxx-removeobjects
      # @param project_dxid [String] Project to remove objects from.
      # @param objects [Array<String>] Objects to remove from project.
      # @return [Hash]
      def project_remove_objects(project_dxid, objects, opts = {})
        call(project_dxid, "removeObjects", opts.merge(objects: objects))
      end
    end
  end
end

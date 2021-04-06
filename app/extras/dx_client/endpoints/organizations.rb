module DXClient
  module Endpoints
    # Contains organizations-related methods.
    module Organizations
      # Invites user to provided organization.
      # @see https://documentation.dnanexus.com/developer/api/organizations#api-method-org-xxxx-invite
      # @param org_dxid [String] Organization to invite user to.
      # @param invitee_dxid [String] Invitee's dxid or email.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def org_invite(org_dxid, invitee_dxid, opts = {})
        call(org_dxid, "invite", opts.merge(invitee: invitee_dxid))
      end

      # Creates new organization.
      # @see https://documentation.dnanexus.com/developer/api/organizations#api-method-org-new
      # @param handle [String] Organization's handle
      # @param name [String] Organization's name.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def org_new(handle, name, opts = {})
        call("org", "new", opts.merge(handle: handle, name: name))
      end

      # Updates organization's billing information.
      # @param org_dxid [String] Organization's dxid.
      # @param billing_info [Hash] Billing information.
      # @param opts [Hash] Additional options.
      def org_update_billing_info(org_dxid, billing_info, opts = {})
        call(org_dxid, "updateBillingInformation", opts.merge(billingInformation: billing_info))
      end

      # Returns description of the provided org.
      # @see https://documentation.dnanexus.com/developer/api/organizations#api-method-org-xxxx-describe
      # @param org_dxid [String] Organization's dxid,
      # @param opts [Hash] Additional options.
      # @return [Hash] Organization's description.
      def org_describe(org_dxid, opts = {})
        call(org_dxid, "describe", opts)
      end

      # Removes user from provided organization.
      # @see https://documentation.dnanexus.com/developer/api/organizations#api-method-org-xxxx-removemember
      # @param org_dxid [String] Organization's dxid.
      # @param user_dxid [String] User's dxid.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def org_remove_member(org_dxid, user_dxid, opts = {})
        call(org_dxid, "removeMember", opts.merge(user: user_dxid))
      end

      # Destroys the specified org.
      # @see https://documentation.dnanexus.com/developer/api/organizations#api-method-org-xxxx-destroy
      # @param org_dxid [String] Organization's dxid.
      # @return [Hash]
      def org_destroy(org_dxid)
        call(org_dxid, "destroy")
      end

      # Find organization's members.
      # @see https://documentation.dnanexus.com/developer/api/organizations#api-method-org-xxxx-findmembers
      # @param org_dxid [String] Organization's dxid.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def org_find_members(org_dxid, opts = {})
        call(org_dxid, "findMembers", opts)
      end
    end
  end
end

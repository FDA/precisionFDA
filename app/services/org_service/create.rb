module OrgService
  module Create
    # @param id [String] ID of the organization ("org-" + handle)
    def self.call(api, id, billable = false)
      papi = DNAnexusAPI.new(ADMIN_TOKEN)

      raise "We did not expect #{id} to exist on DNAnexus" if api.entity_exists?(id)

      handle = Org.handle_by_id(id)
      org = papi.call("org", "new", handle: handle, name: handle)

      auditor_data = {
        action: "create",
        record_type: "Org Provision",
        record: {
          message: "The system is about to start provisioning a new dxorg '#{org[:id]}'"
        }
      }
      Auditor.perform_audit(auditor_data)

      if billable
        auth = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
        auth.call(
          org[:dxorg], "updateBillingInformation",
          billingInformation: billing_info,
          autoConfirm: BILLING_CONFIRMATION
        )
      end

      org
    end

    # private

    def self.billing_info
      {

      }
    end
  end
end

module OrgService
  module Create
    # @param dxid [String] ID of the organization ("org-" + handle)
    def self.call(dxid, billable = false)
      papi = DIContainer.resolve("api.admin")

      raise "The org #{dxid} already exists!" if papi.entity_exists?(dxid)

      handle = Org.handle_by_id(dxid)
      org = papi.org_new(handle, handle)

      auditor_data = {
        action: "create",
        record_type: "Org Provision",
        record: {
          message: "The system is about to start provisioning a new dxorg '#{org[:id]}'",
        },
      }

      Auditor.perform_audit(auditor_data)

      if billable
        auth = DIContainer.resolve("api.auth")

        auth.org_update_billing_info(
          org[:dxorg],
          BILLING_INFO,
          autoConfirm: BILLING_CONFIRMATION,
        )
      end

      org
    end
  end
end

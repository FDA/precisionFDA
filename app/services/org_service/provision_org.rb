module OrgService
  module ProvisionOrg

    def self.call(token, org:, username:, org_handle:, email:, first_name:, last_name:)
      dxuserid = "user-#{username}"
      dxorg = Org.construct_dxorg(org_handle)
      dxorghandle = dxorg.sub(/^org-/, '')

      auth = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
      api = DNAnexusAPI.new(token)
      papi = DNAnexusAPI.new(ADMIN_TOKEN)

      raise "We did not expect #{dxuserid} to exist on DNAnexus" if api.entity_exists?(dxuserid)
      raise "We did not expect org name '#{org}' to exist in the database" if Org.find_by(name: org).present?
      raise "We did not expect org handle '#{org_handle}' to exist in the database" if Org.find_by(handle: org_handle).present?

      if api.entity_exists?(dxorg)
        # Check if the org exists due to earlier failure
        org_description = papi.call(dxorg, "describe")
        raise "We found #{dxorg} to exist already and we are not the only admin" if org_description["admins"] != [ADMIN_USER]
        raise "We found #{dxorg} to exist already but with a different name" if org_description["name"] != org
      else
        papi.call("org", "new", handle: dxorghandle, name: org)
      end

      auth.call(dxorg, "updateBillingInformation",
                billingInformation: billing_info, autoConfirm: BILLING_CONFIRMATION)
      auth.call("user", "new", username: username, email: email,
                               first: first_name, last: last_name, billTo: ORG_EVERYONE)
      papi.call(dxorg, "invite", invitee: dxuserid, level: 'ADMIN', suppressEmailNotification: true )
      papi.call(dxorg, "removeMember", user: ADMIN_USER)
      papi.call(ORG_EVERYONE, "invite", invitee: dxuserid, level: 'MEMBER', allowBillableActivities: false,
                                        appAccess: true, projectAccess: 'VIEW', suppressEmailNotification: true)
    end

    def self.billing_info
      {
        email: "billing@dnanexus.com",
        name: "Elaine Johanson",
        companyName: "FDA",
        address1: "10903 New Hampshire Ave",
        address2: "Bldg. 32 room 2254",
        city: "Silver Spring",
        state: "MD",
        postCode: "20993",
        country: "USA",
        phone: "(301) 706-1836",
      }
    end

  end
end

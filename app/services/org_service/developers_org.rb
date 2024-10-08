module OrgService
  module DevelopersOrg
    def self.create
      papi = DNAnexusAPI.for_admin
      dxorg = choose_dxorg(papi, "app_developers")
      handle = Org.handle_by_id(dxorg)
      org = papi.call("org", "new", handle: handle, name: handle)

      org["id"]
    end

    def self.update_members(dxorg)
      papi = DNAnexusAPI.for_admin
      users = User.review_space_admins.where.not(review_app_developers_org: dxorg)
      users.find_each do |user|
        next if user.dxid == ADMIN_USER

        papi.org_invite(
          dxorg,
          user.dxid,
          level: "ADMIN",
          suppressEmailNotification: true,
        )
      end
      users.update_all(review_app_developers_org: dxorg)
    end

    def self.choose_dxorg(papi, handle = "app_developers")
      new_handle = "#{handle}_#{SecureRandom.hex[0..9]}"
      dxorg = Org.construct_dxorg(new_handle)

      if papi.entity_exists?(dxorg)
        choose_dxorg(papi, handle)
      else
        dxorg
      end
    end
  end
end

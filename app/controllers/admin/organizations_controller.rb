module Admin
  class OrganizationsController < BaseController
    def index
      @orgs = Org.all

      @orgs_grid = initialize_grid(@orgs,{
          name: 'admin_orgs',
          per_page: 100
      })

      js(orgs: @orgs)
    end


    def provision_org
      @org = Org.new
    end

    def create_org
      @org = Org.new(org_params)
      @org.save!
    end

    def update
      @org = Org.find_by_handle(params[:handle])
    end

    def change_admin
      @user = User.find_by_dxuser(params[:user][:dxuser])

      @org = Org.find_by_handle(params[:org][:dxid])

      api = DNAnexusAPI.new(@context.token)

      begin
        users = get_users_of_org(api, @org, @user)

        user_to_update = users.find{|u| u["id"] == "user-" + @user.dxuser}

        if user_to_update.present?
          dxuser = user_to_update["id"].sub("user-","")
          user = User.find_by_dxuser(dxuser)
          set_admin_access(api, @org, user)
        else
          invite_admin_user(api, @org, @user)
        end

        @org.admin = @user
        @org.save!
        redirect_to :back, success: "Admin of the org was updated."
      rescue Net::HTTPServerError => e
        error = "There was an error setting user #{@user.dxid} be an ADMIN of #{org.dxid}"
        redirect_to :back, error
      end
    end

    private

    def invite_admin_user(api, org, user)
      api.call(org.dxid, "invite", invitee: user.dxid, level: 'ADMIN')
    end

    def set_admin_access(api, org, user)
      org_admin = org.admin
      raise "Org must have admin" if org_admin.blank?
      org_info = api.call(org.dxid, "describe")
      #activation_user = org_info["billingInformation"]["activatedBy"] rescue nil

      api.call(org.dxid,"setMemberAccess", "#{user.dxid}": {level:"ADMIN"})


      #if org_admin.dxid != activation_user # lowering ADMIN privileges of activation user leads to ORG clear out.
      #  api.call(org.dxid,"setMemberAccess", "#{org_admin.dxid}": {level:"MEMBER", allowBillableActivities:true, appAccess: true, projectAccess: "CONTRIBUTE"})
      #end
    end

    def get_users_of_org(api, org, user = nil)
      api.call("org-pfda.." + org.handle, "findMembers", *(user.present? ? [id: [user.dxid]] : []))["results"]
    end

    public

    def show
      @org = Org.find_by_handle(params[:handle])
      @can_change_admin = nil
      user = @context.user
      filter = params[:filter]

      api = DNAnexusAPI.new(@context.token)
      begin
        result = get_users_of_org(api, @org, user)
        if result.present? && result.any?{|u| u['level'] == 'ADMIN' && u['id'] == user.dxid}
          @can_change_admin = true
        else
          @can_change_admin = false
        end
      rescue Net::HTTPServerException => e
        @can_change_admin = false # likely no access to that group
      end

      admin_id = @org.admin.present? ? @org.admin.id : nil
      case filter
      when 'pending'
        users = @org.users.where("users.id <> ? and last_login is NULL and private_files_project is NULL", admin_id)
      when 'deactivated'
        users = @org.users.deactivated.where("users.id <> ?", admin_id)
      else
        users = @org.users.enabled.where("users.id <> ? and last_login is not NULL", admin_id)
      end
      admins = User.where("id = ?", admin_id)

      @org_users = initialize_grid(users, {
        per_page: 100
      })

      @org_admins = initialize_grid(admins, {
        per_page: 100
      })

      js(org: {dxid: @org.handle})
    end

    def org_params
      params.require("org").permit!  #!
    end
  end
end

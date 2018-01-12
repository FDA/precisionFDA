class ProfileController < ApplicationController
  helper_method :time_zones

  def index
    @user = User.includes(:org).find(@context.user_id)
    if !@user.singular?
      users = User.where(org_id: @user.org_id)
    else
      users = User.where(id: @user.id)
    end
    @users_grid = initialize_grid(users,{
      order: 'dxuser',
      order_direction: 'asc',
      per_page: 100
    })
  end

  def provision_user
    @user = User.includes(:org).find(@context.user_id)
    raise unless @user.can_provision_accounts?

    @first = params[:first].to_s.strip
    @last = params[:last].to_s.strip
    @email = params[:email].to_s.strip
    @state = params[:state].to_s.strip

    if @state == "step1" || @state == "step2"
      @username = User.construct_username(@first, @last)
      @normalized_email = @email.downcase

      if @first.size < 2
        @error = "The first name must be at least two letters long."
      elsif @last.size < 2
        @error = "The last name must be at least two letters long."
      elsif !User.authserver_acceptable?(@username)
        @error = "Internal precisionFDA policies require that usernames be formed according to the pattern <first_name>.<last_name> using only lowercase English letters. Based on the name you provided (#{@first} #{@last}), the constructed username ('#{@username}') would not have been acceptable. Please adjust the name accordingly."
      elsif !User.validate_email(@email)
        @error = "Invalid email address"
      elsif User.find_by(normalized_email: @normalized_email).present?
        @error = "This email address is already in use by another precisionFDA account."
      elsif DNAnexusAPI.email_exists?(@email)
        @error = "This email address is in use by an existing DNAnexus account. Please ask the person to provide you with a different email to be used for precisionFDA."
      end

      if @error.present?
        # Go back to step 1
        @state = "step1"
      elsif @state == "step1"
        # Proceed to step2
        @warnings = []
        if @username != "#{@first.downcase}.#{@last.downcase}"
          @warnings << "The name you entered contains characters other than English letters (such as spaces, dashes, or accented characters). Those characters cannot be represented in the username. Therefore, please double-check the suggested username; if needed, go back to make changes to the name."
        end
        @suggested_username = unused_username(@username)
        if @suggested_username != @username
          if User.find_by(dxuser: @username).present?
            @warnings << "".html_safe + "There is already another user on precisionFDA with the username '#{@username}'. " + view_context.link_to("Click here to visit their profile", user_path(@username), target: "_blank") + " to make sure that the person you are trying to provision doesn't already exist on precisionFDA. The suggested username has been adjusted to avoid conflicts."
          else
            @warnings << "".html_safe + "There is already another DNAnexus user with the username '#{@username}'. The suggested username has been adjusted to avoid conflicts."
          end
        end
        @state = "step2"
      else
        @suggested_username = unused_username(@username)
        if @suggested_username == params[:suggested_username]
          dxuserid = "user-#{@suggested_username}"
          dxorg = @user.org.dxorg

          AUDIT_LOGGER.info("The system is about to start provisioning user '#{@suggested_username}' under org '#{@user.org.handle}', initiated by '#{@user.dxuser}'")
          auth = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
          auth.call("user", "new", {username: @suggested_username, email: @email, first: @first, last: @last, billTo: ORG_EVERYONE})

          api = DNAnexusAPI.new(@context.token)
          api.call(dxorg, "invite", {invitee: dxuserid, level: 'MEMBER', allowBillableActivities: true, appAccess: true, projectAccess: 'VIEW', suppressEmailNotification: true})

          papi = DNAnexusAPI.new(ADMIN_TOKEN)
          papi.call(ORG_EVERYONE, "invite", {invitee: dxuserid, level: 'MEMBER', allowBillableActivities: false, appAccess: true, projectAccess: 'VIEW', suppressEmailNotification: true})

          user = {}
          user[:dxuser] = @suggested_username
          user[:org_id] = @user.org.id
          user[:schema_version] = User::CURRENT_SCHEMA
          user[:first_name] = @first
          user[:last_name] = @last
          user[:email] = @email
          user[:normalized_email] = @normalized_email
          u = User.create!(user)
          AUDIT_LOGGER.info("A new user has been created under the '#{@user.org.handle}' organization: user=#{u.as_json} by '#{@user.dxuser}'")
          @state = "step3"
        end
      end
    else
      @state = "step1"
    end
  end

  def provision_org
    @user = User.find(@context.user_id)
    raise unless @user.can_administer_site?

    @state = params[:state].to_s.strip
    raise unless @state == "" || @state == "step1" || @state == "step2" || @state == "step3"

    @inv = params[:inv].to_s.strip
    if @state == "" || @inv.blank? || (@inv.to_i.to_s != @inv) || (@invitation = Invitation.find(@inv.to_i)).blank?
      @state = "step1"
      @invitations = Invitation.select(:id, :first_name, :last_name, :email, :org, :singular, :address, :phone, :duns, :user_id, :extras).order(id: :desc)
      return
    end

    @first_name = (params[:first_name] || @invitation.first_name).to_s.strip
    @last_name = (params[:last_name] || @invitation.last_name).to_s.strip
    @email = (params[:email] || @invitation.email).to_s.strip
    @org = (params[:org] || @invitation.org).to_s.strip
    @org_handle = (params[:org_handle] || @invitation.org_handle).to_s
    @address = (params[:address] || @invitation.address).to_s.strip
    @phone = (params[:phone] || @invitation.phone).to_s.strip
    @duns = (params[:duns] || @invitation.duns).to_s.strip

    if @state == "step1"
      @state = "step2"
      return
    end

    @username = User.construct_username(@first_name, @last_name)
    @normalized_email = @email.downcase

    if @first_name.size < 2
      @error = "The first name must be at least two letters long."
    elsif @last_name.size < 2
      @error = "The last name must be at least two letters long."
    elsif !User.authserver_acceptable?(@username)
      @error = "Internal precisionFDA policies require that usernames be formed according to the pattern <first_name>.<last_name> using only lowercase English letters. Based on the name provided (#{@first_name} #{@last_name}), the constructed username ('#{@username}') would not have been acceptable. Please adjust the name accordingly."
    elsif !User.validate_email(@email)
      @error = "Invalid email address"
    elsif User.find_by(normalized_email: @normalized_email).present?
      @error = "This email address is already in use by another precisionFDA account."
    elsif DNAnexusAPI.email_exists?(@email)
      @error = "This email address is in use by an existing DNAnexus account. Please ask the person to provide you with a different email to be used for precisionFDA. Alternatively adjust the email address by adding +pfda before the @ sign (but this may not work for all users)."
    elsif @org_handle.gsub(/[^a-z]/, '') != @org_handle
      @error = "Invalid characters in the organization handle"
    elsif @org_handle.present? && Org.find_by(handle: @org_handle).present?
      @error = "There is already an organization with that handle"
    elsif @org.present? && Org.find_by(name: @org).present?
      @error = "There is already an organization with that name"
    elsif @org.present? != @org_handle.present?
      @error = "You must either provide both the organization name and the handle (for org admins), or leave them both empty (for self-represented)."
    end

    if @error.present?
      @state = "step2"
      return
    end

    if @state == "step2"
      # Proceed to step3
      @warnings = []
      if @username != "#{@first_name.downcase}.#{@last_name.downcase}"
        @warnings << "The entered name contains characters other than English letters (such as spaces, dashes, or accented characters). Those characters cannot be represented in the username. Therefore, please double-check the suggested username; if needed, go back to make changes to the name."
      end
      @suggested_username = unused_username(@username)
      if @suggested_username != @username
        if User.find_by(dxuser: @username).present?
          @warnings << "".html_safe + "There is already another user on precisionFDA with the username '#{@username}'. " + view_context.link_to("Click here to visit their profile", user_path(@username), target: "_blank") + " to make sure that the person you are trying to provision doesn't already exist on precisionFDA. The suggested username has been adjusted to avoid conflicts."
        else
          @warnings << "".html_safe + "There is already another DNAnexus user with the username '#{@username}'. The suggested username has been adjusted to avoid conflicts."
        end
      end
      if @invitation.singular && @invitation.org.present?
        @warnings << "The original invitation included an organization but also ticked the 'self-represented' box. Make sure you are making the right choice between those two options."
      end
      if @invitation.singular && !@invitation.org.present? && @org.present?
        @warnings << "The original invitation ticked the 'self-represented' box but you supplied an organization. Please double-check this is what you want."
      end
      if !@invitation.singular && @invitation.org.present? && !@org.present? && !@org_handle.present?
        @warnings << "The original invitation supplied an organization but you are about to provision a self-represented user. Please double-check this is what you want."
      end
      @state = "step3"
    else
      @suggested_username = unused_username(@username)
      if @suggested_username == params[:suggested_username]
        @state = "step4"

        raise unless @org.present? == @org_handle.present?

        @singular = false
        if !@org_handle.present?
          @org = "#{@first_name} #{@last_name} (#{@suggested_username})"
          @org_handle = @suggested_username
          @singular = true
        end

        dxuserid = "user-#{@suggested_username}"
        dxorg = Org.construct_dxorg(@org_handle)
        dxorghandle = dxorg.sub(/^org-/, '')

        auth = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
        api = DNAnexusAPI.new(@context.token)
        papi = DNAnexusAPI.new(ADMIN_TOKEN)

        raise "We did not expect #{dxuserid} to exist on DNAnexus" if api.entity_exists?(dxuserid)
        raise "We did not expect org name '#{@org}' to exist in the database" if Org.find_by(name: @org).present?
        raise "We did not expect org handle '#{@org_handle}' to exist in the database" if Org.find_by(handle: @org_handle).present?

        AUDIT_LOGGER.info("The system is about to start provisioning admin '#{@suggested_username}' and org '#{@org_handle}'#{@singular ? ' (self-represented)' : ''} initiated by '#{@user.dxuser}'")
        if api.entity_exists?(dxorg)
          # Check if the org exists due to earlier failure
          org_description = papi.call(dxorg, "describe")
          raise "We found #{dxorg} to exist already and we are not the only admin" if org_description["admins"] != [ADMIN_USER]
          raise "We found #{dxorg} to exist already but with a different name" if org_description["name"] != @org
        else
          papi.call("org", "new", {handle: dxorghandle, name: @org})
        end

        billing_info = {
          email: "billing@dnanexus.com",
          name: "Elaine Johanson",
          companyName: "FDA",
          address1: "10903 New Hampshire Ave",
          address2: "Bldg. 32 room 2254",
          city: "Silver Spring",
          state: "MD",
          postCode: "20993",
          country: "USA",
          phone: "(301) 706-1836"
        }
        auth.call(dxorg, "updateBillingInformation", {billingInformation: billing_info, autoConfirm: BILLING_CONFIRMATION})
        auth.call("user", "new", {username: @suggested_username, email: @email, first: @first_name, last: @last_name, billTo: ORG_EVERYONE})
        papi.call(dxorg, "invite", {invitee: dxuserid, level: 'ADMIN', suppressEmailNotification: true})
        papi.call(dxorg, "removeMember", {user: ADMIN_USER})
        papi.call(ORG_EVERYONE, "invite", {invitee: dxuserid, level: 'MEMBER', allowBillableActivities: false, appAccess: true, projectAccess: 'VIEW', suppressEmailNotification: true})

        o = nil
        u = nil
        User.transaction do
          org = {}
          org[:name] = @org
          org[:handle] = @org_handle
          org[:address] = @address
          org[:duns] = @duns
          org[:phone] = @phone
          org[:singular] = @singular
          org[:state] = "complete"
          o = Org.create!(org)

          user = {}
          user[:dxuser] = @suggested_username
          user[:org_id] = o.id
          user[:schema_version] = User::CURRENT_SCHEMA
          user[:first_name] = @first_name
          user[:last_name] = @last_name
          user[:email] = @email
          user[:normalized_email] = @normalized_email
          u = User.create!(user)
          o.update!(admin_id: u.id)
        end
        Invitation.find(@inv.to_i).update(user_id: u.id)
        AUDIT_LOGGER.info("A new admin and organization have been created: user=#{u.as_json}, org=#{o.as_json} by '#{@user.dxuser}'")
      end
    end
  end

  def run_report
    @user = User.includes(:org).find(@context.user_id)
    raise unless @user.can_administer_site?

    Axlsx::Package.new do |p|
      p.use_autowidth = true
      Time.use_zone ActiveSupport::TimeZone.new('America/New_York') do
        p.workbook.add_worksheet(:name => "Users") do |sheet|
          sheet.add_row ["", "", "username", "first name", "last name", "email", "provisioned at", "last login", "bytes stored", "apps count", "jobs count"]
          Org.order(:name).all.each do |org|
            ["name", "handle", "address", "phone"].each do |label|
              sheet.add_row ["Organization #{label}:", org.send(label)]
            end
            users = [org.admin] + org.users.order(:dxuser).all.reject { |u| u.id == org.admin_id }
            users.each do |user|
              role = user.id == org.admin_id ? "Admin:" : "Member:"
              sheet.add_row [role, "", user.dxuser, user.first_name, user.last_name, user.email, user.created_at.strftime("%Y-%m-%d %H:%M"), user.last_login ? user.last_login.strftime("%Y-%m-%d %H:%M") : "", user.user_files.sum(:file_size), user.app_series.count, user.jobs.count]
            end
            sheet.add_row
          end
        end
        p.workbook.add_worksheet(:name => "Requests") do |sheet|
          sheet.add_row ["time", "in_system?", "first name", "last name", "email", "organization", "self-represent?", "address", "phone", "duns", "consistency challenge?", "truth challenge?", "research?", "clinical?", "has data?", "has software?", "reason" ]
          Invitation.includes(:user).find_each do |inv|
            row = []
            row << inv.created_at.strftime("%Y-%m-%d %H:%M")
            if inv.user.present?
              row << inv.user.dxuser
            else
              u = User.where.any_of({first_name: inv.first_name, last_name: inv.last_name}, {normalized_email: inv.email.downcase.strip}).take
              row << (u ? "maybe #{u.dxuser}" : "")
            end
            row += [inv.first_name, inv.last_name, inv.email, inv.org, inv.singular, inv.address, inv.phone, inv.duns, inv.participate_intent, inv.organize_intent, inv.research_intent, inv.clinical_intent, inv.req_data, inv.req_software, inv.req_reason]
            sheet.add_row row
          end
        end
        filename = Time.current.strftime("precisionfda-report-%Y-%m-%d.xlsx")

        send_data p.to_stream.read, filename: filename, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        return
      end
    end
  end

private

  def unused_username(username)
    api = DNAnexusAPI.new(@context.token)
    candidate = username
    i = 2
    while api.user_exists?(candidate)
      candidate = "#{username}.#{i}"
      i = i + 1
    end
    return candidate
  end

  def time_zones
    ActiveSupport::TimeZone.all.map do |time_zone|
      ["(GMT#{time_zone.now.formatted_offset}) #{time_zone.name}", time_zone.name]
    end
  end

end

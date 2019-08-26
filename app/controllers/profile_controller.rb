class ProfileController < ApplicationController
  include ErrorProcessable
  helper_method :time_zones
  before_action :find_admin, only: [:provision_org]

  def index
    usa_id = Country.find_by(name: "United States").id
    @user = User.includes(:org).find(@context.user_id)
    users = if !@user.singular?
      User.where(org_id: @user.org_id)
    else
      User.where(id: @user.id)
    end
    @users_grid = initialize_grid(users,
      order: 'dxuser',
      order_direction: 'asc',
      per_page: 100
    )
    profile = Profiles::Getter.call(@user, @context).view_fields
    js(usa_id: usa_id, country_codes: Country.countries_for_codes, profile: profile)
  end

  def update
    profile = current_user.profile || current_user.build_profile
    if Profiles::Updater.call(params, @context, profile)
      render json: profile.view_fields, status: :ok
    else
      render json: profile.errors, status: :unprocessable_entity
    end
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
        @error =
          "Email address is already in use in precisionFDA. " \
          "Please ask the person to provide you with a different email to be used in precisionFDA."
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
        @suggested_username = find_unused_username(@username)
        if @suggested_username != @username
          if User.find_by(dxuser: @username).present?
            @warnings << "".html_safe + "There is already another user on precisionFDA with the username '#{@username}'. " + view_context.link_to("Click here to visit their profile", user_path(@username), target: "_blank") + " to make sure that the person you are trying to provision doesn't already exist on precisionFDA. The suggested username has been adjusted to avoid conflicts."
          else
            @warnings << "".html_safe + "There is already another DNAnexus user with the username '#{@username}'. The suggested username has been adjusted to avoid conflicts."
          end
        end
        @state = "step2"
      else
        @suggested_username = find_unused_username(@username)
        if @suggested_username == params[:suggested_username]
          dxuserid = "user-#{@suggested_username}"
          dxorg = @user.org.dxorg

          Auditor.perform_audit(action: "create", record_type: "Provision User", record: { message: "The system is about to start provisioning user '#{@suggested_username}' under org '#{@user.org.handle}', initiated by '#{@user.dxuser}'" })
          auth = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
          auth.call("user", "new", username: @suggested_username, email: @email, first: @first, last: @last, billTo: ORG_EVERYONE)

          api = DNAnexusAPI.new(@context.token)
          api.call(dxorg, "invite", invitee: dxuserid, level: 'MEMBER', allowBillableActivities: true, appAccess: true, projectAccess: 'VIEW', suppressEmailNotification: true)

          papi = DNAnexusAPI.new(ADMIN_TOKEN)
          papi.call(ORG_EVERYONE, "invite", invitee: dxuserid, level: 'MEMBER', allowBillableActivities: false, appAccess: true, projectAccess: 'VIEW', suppressEmailNotification: true)

          user = {}
          user[:dxuser] = @suggested_username
          user[:org_id] = @user.org.id
          user[:schema_version] = User::CURRENT_SCHEMA
          user[:first_name] = @first
          user[:last_name] = @last
          user[:email] = @email
          user[:normalized_email] = @normalized_email
          u = User.create!(user)

          auditor_data = {
            action: "create",
            record_type: "Provision User",
            record: {
              message: "A new user has been created under the '#{@user.org.handle}' organization: user=#{u.as_json} by '#{@user.dxuser}'",
            },
          }
          Auditor.perform_audit(auditor_data)
          @state = "step3"
        end
      end
    else
      @state = "step1"
    end
  end

  def provision_org
    if request.get?
      @invitations = Invitation.order(id: :desc).page(params[:page]).per(10)
      @state = "step1"
      return
    end

    @inv = params[:inv]
    @invitation = Invitation.find_by(id: @inv)

    @first_name = (params[:first_name] || @invitation.first_name).to_s.strip
    @last_name = (params[:last_name] || @invitation.last_name).to_s.strip
    @email = (params[:email] || @invitation.email).to_s.strip
    @org = (params[:org] || @invitation.org).to_s.strip
    @org_handle = (params[:org_handle] || @invitation.org_handle).to_s
    @address1 = (params[:address1] || @invitation.address1).to_s.strip
    @address2 = (params[:address2] || @invitation.address2).to_s.strip
    @postal_code = (params[:postal_code] || @invitation.postal_code).to_s.strip
    @country = (params[:country] || @invitation.country.name).to_s.strip
    @city = (params[:city] || @invitation.city).to_s.strip
    @us_state = (params[:us_state] || @invitation.us_state).to_s.strip
    @full_phone = (params[:full_phone] || @invitation.full_phone).to_s.strip
    @duns = (params[:duns] || @invitation.duns).to_s.strip
    @organization_administration = params[:organization_administration]

    case params[:state]
    when "step2"
      @state = "step2"

    when "step3"

      if params[:organization_administration] != 'admin'
        # clean out org vars.
        @org = nil
        @org_handle = nil
      end
      add_errors(@first_name, @last_name, @email, @org, @org_handle)

      if @errors.any?
        @state = "step2"
        return
      end

      add_warnings(@first_name, @last_name, @invitation, @org, @org_handle)

      @state = "step3"
    when "step4"
      if params[:organization_administration] != 'admin'
        # clean out org vars.
        @org = nil
        @org_handle = nil
      end
      raise unless @org.present? == @org_handle.present?
      username = User.construct_username(@first_name, @last_name)
      @suggested_username = find_unused_username(username)

      @singular = false
      unless @org_handle.present?
        @org = "#{@first_name} #{@last_name} (#{@suggested_username})"
        @org_handle = @suggested_username
        @singular = true
      end

      Auditor.perform_audit(action: "create", record_type: "Provision Org", record: { message: "The system is about to start provisioning admin '#{@suggested_username}' and org '#{@org_handle}'#{@singular ? ' (self-represented)' : ''} initiated by '#{@user.dxuser}'" })

      OrgService::ProvisionOrg.call(@context.token, org: @org, username: @suggested_username, org_handle: @org_handle,
                                    email: @email, first_name: @first_name, last_name: @last_name)

      User.transaction do
        org = Org.create!(name: @org, handle: @org_handle, address: @address1,
                          duns: @duns, phone: @full_phone, singular: @singular, state: "complete")
        user = org.users.create!(dxuser: @suggested_username, schema_version: User::CURRENT_SCHEMA, email: @email,
                                 first_name: @first_name, last_name: @last_name, normalized_email: @email.downcase)
        org.update!(admin_id: user.id)
        @invitation.update!(user_id: user.id)

        phone_confirmed = @invitation.new_phone_format? ? true :false
        profile = user.build_profile(@invitation.slice(:address1, :address2, :phone, :city, :us_state, :postal_code,
                                                       :country, :phone_country).merge(phone_confirmed: phone_confirmed, email: @email))
        profile.save(validate: false)
        Auditor.perform_audit(action: "create", record_type: "Provision Org",
                              record: { message: "A new admin and organization have been created: user=#{user.as_json}, org=#{org.as_json} by '#{@user.dxuser}'" })
      end
      @state = "step4"
    end
  end

  def run_report
    @user = User.includes(:org).find(@context.user_id)
    raise unless @user.can_administer_site?

    Axlsx::Package.new do |p|
      p.use_autowidth = true
      Time.use_zone ActiveSupport::TimeZone.new('America/New_York') do
        p.workbook.add_worksheet(name: "Users") do |sheet|
          sheet.add_row ["", "", "username", "first name", "last name", "email", "provisioned at", "last login", "bytes stored", "apps count", "jobs count"]
          Org.reports(sheet)
        end
        p.workbook.add_worksheet(name: "Requests") do |sheet|
          sheet.add_row ["time", "in_system?", "first name", "last name", "email", "organization", "self-represent?", "country", "city", "state", "postal code", "address1", "address2", "phone", "duns", "consistency challenge?", "truth challenge?", "research?", "clinical?", "has data?", "has software?", "reason"]
          Invitation.includes(:user).find_each do |inv|
            row = []
            row << inv.created_at.strftime("%Y-%m-%d %H:%M")
            if inv.user.present?
              row << inv.user.dxuser
            else
              u = User.where.any_of({ first_name: inv.first_name, last_name: inv.last_name }, normalized_email: inv.email.downcase.strip).take
              row << (u ? "maybe #{u.dxuser}" : "")
            end
            row += [inv.first_name, inv.last_name, inv.email, inv.org, inv.singular, inv.country.try(:name), inv.city, inv.us_state, inv.postal_code, inv.address1, inv.address2, inv.full_phone, inv.duns, inv.participate_intent, inv.organize_intent, inv.research_intent, inv.clinical_intent, inv.req_data, inv.req_software, inv.req_reason]
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

  def find_admin
    @user = User.find(@context.user_id)
    raise unless @user.can_administer_site?
  end

  def add_errors(first_name, last_name, email, org, org_handle)
    @errors = []

    new_user = User.new(first_name: first_name, last_name: last_name, email: email)
    if new_user.invalid?
      @errors += new_user.errors.full_messages
    end

    username = User.construct_username(first_name, last_name)
    if !User.authserver_acceptable?(username)
      @errors << "Internal precisionFDA policies require that usernames be formed according to the pattern <first_name>.<last_name> using only lowercase English letters. Based on the name provided (#{first_name} #{last_name}), the constructed username ('#{username}') would not have been acceptable. Please adjust the name accordingly."
    end

    if params[:organization_administration] == 'admin'
      @errors << "You must provide both the organization name and the handle" if !@org.present? && !@org_handle.present?
      @errors << "Invalid characters in the organization handle" if @org_handle.present? && @org_handle.gsub(/[^a-z]/, '') != @org_handle
      @errors << "There is already an organization with that handle" if @org_handle.present? && Org.find_by(handle: @org_handle).present?
      @errors << "There is already an organization with that name" if @org.present? && Org.find_by(name: @org).present?
      @errors << "You must either provide both the organization name and the handle (for org admins), or leave them both empty (for self-represented)." if @org.present? != @org_handle.present?
    end

    if email.present? && DNAnexusAPI.email_exists?(email)
      @errors << "Email address is already in use in precisionFDA. " \
                 "Please ask the person to provide you with a different email to " \
                 "be used for precisionFDA."
    end
  end

  def add_warnings(first_name, last_name, invitation, org, org_handle)
    @warnings = []

    username = User.construct_username(first_name, last_name)
    if username != "#{first_name.downcase}.#{last_name.downcase}"
      @warnings << "The entered name contains characters other than English letters (such as spaces, dashes, or accented characters). Those characters cannot be represented in the username. Therefore, please double-check the suggested username; if needed, go back to make changes to the name."
    end
    @suggested_username = find_unused_username(username)
    if @suggested_username != username
      if User.find_by(dxuser: username).present?
        @warnings << "".html_safe + "There is already another user on precisionFDA with the username '#{username}'. " + view_context.link_to("Click here to visit their profile", user_path(username), target: "_blank") + " to make sure that the person you are trying to provision doesn't already exist on precisionFDA. The suggested username has been adjusted to avoid conflicts."
      else
        @warnings << "".html_safe + "There is already another DNAnexus user with the username '#{username}'. The suggested username has been adjusted to avoid conflicts."
      end
    end
    if invitation.singular && invitation.org.present?
      @warnings << "The original invitation included an organization but also ticked the 'self-represented' box. Make sure you are making the right choice between those two options."
    end
    if invitation.singular && invitation.organization_admin
      @warnings << "The original invitation ticked both the organization admin and 'self-represented' boxes. Make sure you are making the right choice between those two options."
    end
    if invitation.singular && !invitation.org.present? && org.present?
      @warnings << "The original invitation ticked the 'self-represented' box but you supplied an organization. Please double-check this is what you want."
    end
    if !invitation.singular && invitation.org.present? && !org.present? && !org_handle.present?
      @warnings << "The original invitation supplied an organization but you are about to provision a self-represented user. Please double-check this is what you want."
    end
    if invitation.organization_admin && org.blank?
      @warnings << "The original invitation ticked the organization admin box but you are about to provision a self-represented user. Please double-check this is what you want."
    end
  end

  def find_unused_username(username)
    api = DNAnexusAPI.new(@context.token)
    candidate = username
    i = 2
    while api.user_exists?(candidate)
      candidate = "#{username}.#{i}"
      i += 1
    end
    candidate
  end

  def time_zones
    ActiveSupport::TimeZone.all.map do |time_zone|
      ["(GMT#{time_zone.now.formatted_offset}) #{time_zone.name}", time_zone.name]
    end
  end
end

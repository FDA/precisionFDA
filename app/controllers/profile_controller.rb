# TODO: to be refactored
#
class ProfileController < ApplicationController
  include ErrorProcessable
  include Naming

  helper_method :time_zones
  before_action :find_admin, only: %i(provision_org)

  # rubocop:disable Metrics/MethodLength
  def index
    usa_id = Country.find_by(name: "United States").id
    @user = User.includes(:org).find(@context.user_id)
    org_id = @user.singular? ? nil : @user.org_id

    users = if !@user.singular?
      User.where(org_id: @user.org_id)
    else
      User.where(id: @user.id)
    end

    @users_grid = initialize_grid(
      users,
      order: "dxuser",
      order_direction: "asc",
      per_page: 100,
    )

    profile = Profiles::Getter.call(@user, @context).view_fields

    js(usa_id: usa_id, country_codes: Country.countries_for_codes, profile: profile, org_id: org_id)
  end

  def update
    profile = current_user.profile || current_user.build_profile

    if Profiles::Updater.call(unsafe_params, @context, profile)
      render json: profile.view_fields, status: :ok
    else
      render json: profile.errors, status: :unprocessable_entity
    end
  end

  def provision_user
    @user = User.includes(:org).find(@context.user_id)
    raise unless @user.can_provision_accounts?

    @first = unsafe_params[:first].to_s.strip
    @last = unsafe_params[:last].to_s.strip
    @email = unsafe_params[:email].to_s.strip
    @state = unsafe_params[:state].to_s.strip

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
        name = User.find_by(email: email) ? "precisionFDA" : "DNAnexus"
        @error = "This email address is already in use in #{name}. Please ask the person " \
         "to provide you with a different email to be used for precisionFDA."
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
        if @suggested_username == unsafe_params[:suggested_username]
          dxuserid = "user-#{@suggested_username}"
          dxorg = @user.org.dxorg

          Auditor.perform_audit(action: "create", record_type: "Provision User", record: { message: "The system is about to start provisioning user '#{@suggested_username}' under org '#{@user.org.handle}', initiated by '#{@user.dxuser}'" })
          auth = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
          auth.call("user", "new", username: @suggested_username, email: @email, first: @first, last: @last, billTo: ORG_EVERYONE)

          api = DNAnexusAPI.new(@context.token)
          api.call(dxorg, "invite", invitee: dxuserid, level: 'MEMBER', allowBillableActivities: true, appAccess: true, projectAccess: 'VIEW', suppressEmailNotification: true)

          papi = DNAnexusAPI.new(ADMIN_TOKEN)
          papi.call(ORG_EVERYONE, "invite", invitee: dxuserid, level: 'MEMBER', allowBillableActivities: false, appAccess: true, projectAccess: 'VIEW', suppressEmailNotification: true)

          new_user = User.new do |u|
            u.dxuser = @suggested_username
            u.org_id = @user.org.id
            u.schema_version = User::CURRENT_SCHEMA
            u.first_name = @first
            u.last_name = @last
            u.email = @email
            u.normalized_email = @normalized_email
            u.pricing_map = CloudResourceDefaults::PRICING_MAP
            u.job_limit = CloudResourceDefaults::JOB_LIMIT
            u.total_limit = CloudResourceDefaults::TOTAL_LIMIT
            u.resources = CloudResourceDefaults::RESOURCES
            u.charges_baseline = @user.charges_baseline
          end
          ActiveRecord::Base.transaction do
            new_user.save!
            NotificationPreference.create_for_user!(new_user)
            auditor_data = {
              action: "create",
              record_type: "Provision User",
              record: {
                message: "A new user has been created under the '#{@user.org.handle}' organization: user=#{new_user.as_json} by '#{@user.dxuser}'",
              },
            }
            Auditor.perform_audit(auditor_data)
          end
          @state = "step3"
        end
      end
    else
      @state = "step1"
    end
  end

  def provision_org
    if request.get?
      @invitations = Invitation.non_singular.includes(space_invitations: :space).
        order(id: :desc).
        page(params[:page])
      @state = "step1"
      return
    end

    @inv = unsafe_params[:inv]
    @invitation = Invitation.find_by(id: @inv)

    @first_name = (unsafe_params[:first_name] || @invitation.first_name).to_s.strip
    @last_name = (unsafe_params[:last_name] || @invitation.last_name).to_s.strip
    @email = (unsafe_params[:email] || @invitation.email).to_s.strip
    @address1 = (unsafe_params[:address1] || @invitation.address1).to_s.strip
    @address2 = (unsafe_params[:address2] || @invitation.address2).to_s.strip
    @postal_code = (unsafe_params[:postal_code] || @invitation.postal_code).to_s.strip
    @country = (unsafe_params[:country] || @invitation.country.name).to_s.strip
    @city = (unsafe_params[:city] || @invitation.city).to_s.strip
    @us_state = (unsafe_params[:us_state] || @invitation.us_state).to_s.strip
    @full_phone = (unsafe_params[:full_phone] || @invitation.full_phone).to_s.strip
    @duns = (unsafe_params[:duns] || @invitation.duns).to_s.strip

    raise unless @org.present? == @org_handle.present?

    username = User.construct_username(@first_name, @last_name)
    @suggested_username = find_unused_username(username)
    @org = "#{@first_name.capitalize} #{@last_name.capitalize}"
    @org_handle = @suggested_username
    @singular = true

    case unsafe_params[:state]
    when "step2"
      @state = "step2"

    when "step3"

      if unsafe_params[:organization_administration] != "admin"
        # clean out org vars.
        @org = nil
        @org_handle = nil
      end

      errors_verifiable_attributes = {
        first_name: @first_name,
        last_name: @last_name,
        email: @email,
        org: @org,
        org_handle: @org_handle,
      }
      @errors = add_errors(errors_verifiable_attributes)

      if @errors.any?
        @state = "step2"
        return
      end

      @warnings = add_warnings(@invitation, @org, @org_handle, @suggested_username)
      @state = "step3"

    when "step4"
      provision_params = {
        org: @org,
        username: @suggested_username,
        org_handle: @org_handle,
        email: @email,
        first_name: @first_name,
        last_name: @last_name,
        address: @address1,
        duns: @duns,
        phone: @full_phone,
        singular: @singular,
      }

      service = DIContainer.resolve("orgs.provisioner")
      service.call(@user, @invitation, provision_params)

      @state = "step4"
    end
  end

  def check_spaces_permissions
    https_apps_client = DIContainer.resolve("https_apps_client")
    https_apps_client.check_spaces_permissions
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
              u = User.where(first_name: inv.first_name, last_name: inv.last_name).
                or(User.where({normalized_email: inv.email.downcase.strip})).take

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

  # Returns array of time zones ordered by UTC offset.
  # @return [Array[Array<String, String>]] Array of time zones info.
  #   Each element of returning array is array where:
  #     First element is formatted GMT offset.
  #     Second element is time zone name.
  def time_zones
    sorted_time_zones = ActiveSupport::TimeZone.all.sort_by do |time_zone|
      [time_zone.now.utc_offset, time_zone.name]
    end

    sorted_time_zones.map do |time_zone|
      ["(GMT#{time_zone.now.formatted_offset}) #{time_zone.name}", time_zone.name]
    end
  end
  # rubocop:enable Metrics/MethodLength
end

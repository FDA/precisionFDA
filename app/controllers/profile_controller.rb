class ProfileController < ApplicationController
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
          user[:open_files_count] = 0
          user[:closing_files_count] = 0
          user[:pending_comparisons_count] = 0
          user[:pending_jobs_count] = 0
          user[:open_assets_count] = 0
          user[:closing_assets_count] = 0
          user[:first_name] = @first
          user[:last_name] = @last
          user[:email] = @email
          user[:normalized_email] = @normalized_email
          u = User.create!(user)
          AUDIT_LOGGER.info("A new user has been created under the '#{@user.org.handle}' organization: user=#{u.as_json}")
          @state = "step3"
        end
      end
    else
      @state = "step1"
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

end


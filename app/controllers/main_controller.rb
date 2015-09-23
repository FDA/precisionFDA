class MainController < ApplicationController
  skip_before_action :require_login

  def index
    if @context.logged_in?
      @debug_info = "Debugging information from your cookie\nRails user id: #{@context.user_id}\nDNAnexus username: #{@context.username}\nDNAnexus token: #{@context.token}\nDNAnexus credentials expiration: #{Time.at(@context.expiration).to_s}"
    end
  end

  def destroy
    reset_session
    flash[:success] = "You were successfully logged out of precisionFDA"
    redirect_to root_url
  end

  def login
    @remote_login_url = "#{DNANEXUS_AUTHSERVER_URI}oauth2/authorize?response_type=code&client_id=precision_fda&redirect_uri=#{URI.encode(OAUTH2_REDIRECT_URI)}"
  end

  def return_from_login
    # Ensure we were sent here from DNAnexus
    # TODO: Add referrer check
    raise unless params[:code].present? && params[:code].is_a?(String)

    # Exchange the code for a token
    result = DNAnexusAuth.new(DNANEXUS_AUTHSERVER_URI).post_form("oauth2/token", {grant_type: "authorization_code", code: params[:code], redirect_uri: OAUTH2_REDIRECT_URI})
    raise unless result["access_token"].present? && result["token_type"] == "bearer"
    token = result["access_token"]

    # Extract username
    full_username = result["user_id"]
    raise unless full_username.start_with?("user-")
    username = full_username[/^user-(.+)$/, 1]

    # Extract expiration date
    expiration_duration = result["expires_in"].to_i
    expiration_time = Time.now.to_i + expiration_duration

    #
    # TODO: In the future, the FDA may provision accounts, at which point the system will partially initialize
    # the user model (and, using the FDA's credentials, add the user to org-precisionfda.users). Then, when the
    # user logs in for the first time, the system will use the user's credentials to create all requires projects.
    #
    # For now there is this stub to create the user model and do all actions upon first user login. This requires
    # some stored credentials for the org-precisionfda.users admin.
    #
    user = nil
    User.transaction do
      user = User.find_by(dxuser: username)
      if user.nil?
        api = DNAnexusAPI.new(token)
        # TODO: If any of these (or the transaction) fail, there will be debris
        # Private files
        private_files_project = api.call("project", "new", {name: "precisionfda-personal-files-#{username}"})["id"]
        # Private comparisons
        private_comparisons_project = api.call("project", "new", {name: "precisionfda-personal-comparisons-#{username}"})["id"]
        # Public files
        public_files_project = api.call("project", "new", {name: "precisionfda-public-files-#{username}"})["id"]
        api.call(public_files_project, "invite", {invitee: "org-precisionfda.users", level: "VIEW", suppressEmailNotification: true})
        # Public comparisons
        public_comparisons_project = api.call("project", "new", {name: "precisionfda-public-comparisons-#{username}"})["id"]
        api.call(public_comparisons_project, "invite", {invitee: "org-precisionfda.users", level: "VIEW", suppressEmailNotification: true})
        # Add user to org-precisionfda.users so they gain access to others' public projects
        admin_api = DNAnexusAPI.new("BEI5ErikmLb8kmQUPiHz7JB78reoftSL")
        admin_api.call("org-precisionfda.users", "invite", {invitee: "user-#{username}", suppressEmailNotification: true})

        user = User.create!(
          dxuser: username,
          private_files_project: private_files_project,
          public_files_project: public_files_project,
          private_comparisons_project: private_comparisons_project,
          public_comparisons_project: public_comparisons_project,
          open_files_count: 0,
          closing_files_count: 0,
          pending_comparisons_count: 0,
          schema_version: User::CURRENT_SCHEMA
        )
      end
    end

    # Log in
    save_session(user.id, username, token, expiration_time)

    redirect_to root_path
  end
end

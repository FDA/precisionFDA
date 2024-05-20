module ErrorProcessable
  extend ActiveSupport::Concern

  included do
    rescue_from ApiError, with: :render_error_method
  end

  def render_error_method(error)
    json = { error: { type: "API Error", message: error.message } }
    json[:data] = error.data unless error.data.empty?
    render json: json, status: :unprocessable_entity
  end

  def fail(msg, data = {})
    raise ApiError.new(msg, data)
  end

  alias_method :raise_api_error, :fail

  def add_errors(attributes)
    username = attributes[:username] ||
               User.construct_username(attributes[:first_name], attributes[:last_name])

    errors = []
    errors << username_pattern_error(username)
    errors += user_invalid_errors(attributes.slice(:first_name, :last_name, :email))
    errors += org_errors(attributes[:org], attributes[:org_handle])
    errors << email_exists_error(attributes[:email])
    errors.reject(&:blank?)
  end

  def user_invalid_errors(opts = {})
    new_user = User.new(opts)
    new_user.invalid? ? new_user.errors.full_messages : []
  end

  def username_pattern_error(username)
    return if User.authserver_acceptable?(username)

    "Internal precisionFDA policies require that usernames be formed according" \
    "to the pattern <first_name>.<last_name> using only lowercase English letters. " \
    "\nThe constructed username ('#{username}') would not have been acceptable. \nPlease " \
    "adjust the name accordingly."
  end

  def org_errors(org, org_handle)
    return [] if params[:organization_administration] != "admin"

    [].tap do |errors|
      errors << name_handle_present(org, org_handle)
      errors << handle_invalid(org_handle)
      errors << org_with_name_present(org)
      errors << org_with_handle_present(org_handle)
    end
  end

  def name_handle_present(org, org_handle)
    return if org.present? && org_handle.present?

    "You must provide both the organization name and the handle"
  end

  def handle_invalid(org_handle)
    return if org_handle.present? && org_handle.gsub(/[^a-z]/, "") == org_handle

    "Invalid characters in the organization handle"
  end

  def org_with_handle_present(org_handle)
    return if org_handle.present? && !Org.find_by(handle: org_handle)

    "There is already an organization with that handle"
  end

  def org_with_name_present(org)
    return if org.present? && !Org.find_by(name: org)

    "There is already an organization with that name"
  end

  def email_exists_error(email)
    return if email.blank? || !DNAnexusAPI.email_exists?(email)

    name = User.find_by(email: email) ? "precisionFDA" : "DNAnexus"
    I18n.t("email_taken", side: name)
  end

  def add_warnings(invitation, org, org_handle, suggested_username)
    warnings = []

    if User.find_by(dxuser: suggested_username).present?
      link = view_context.link_to(
        I18n.t("provision.profile_link"),
        user_path(suggested_username),
        target: "_blank",
        rel: "noopener",
      )

      warnings << I18n.t("provision.dxuser_already_used", link: link, username: suggested_username)
    end

    if invitation.singular && invitation.org.present?
      warnings << I18n.t("provision.org_invitation_but_self_represented_on")
    end

    if invitation.singular && invitation.organization_admin
      warnings << I18n.t("provision.both_org_admin_and_self_represented_on")
    end

    if invitation.singular && invitation.org.blank? && org.present?
      warnings << I18n.t("provision.self_represented_on_but_org")
    end

    if !invitation.singular && invitation.org.present? && org.blank? && org_handle.blank?
      warnings << I18n.t("provision.org_but_self_represented_on")
    end

    if invitation.organization_admin && org.blank?
      warnings << I18n.t("provision.org_admin_but_self_represented_on")
    end

    warnings
  end
end

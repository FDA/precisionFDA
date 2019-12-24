module ErrorProcessable
  extend ActiveSupport::Concern

  included do
    rescue_from ApiError, with: :render_error_method
  end

  def render_error_method(error)
    json = { error: { type: "API Error", message: error.message } }
    json[:data] = error.data unless error.data.empty?
    render json: json, status: 422
  end

  def fail(msg, data = {})
    raise ApiError.new(msg, data)
  end

  def add_errors(attributes)
    first_name = attributes[:first_name]
    last_name = attributes[:last_name]
    email = attributes[:email]

    errors = []
    errors += user_invalid_errors(first_name: first_name, last_name: last_name, email: email)
    errors << user_name_pattern_error(first_name, last_name)
    errors += org_errors(attributes[:org], attributes[:org_handle])
    errors << email_exists_error(email)
    errors.reject(&:blank?)
  end

  def user_invalid_errors(opts = {})
    new_user = User.new(opts)
    new_user.invalid? ? new_user.errors.full_messages : []
  end

  def user_name_pattern_error(first_name, last_name)
    username = User.construct_username(first_name, last_name)
    return if User.authserver_acceptable?(username)

    "Internal precisionFDA policies require that usernames be formed according" \
    "to the pattern <first_name>.<last_name> using only lowercase English letters. " \
    "\nBased on the name provided (#{first_name} #{last_name}), the constructed username" \
    " ('#{username}') would not have been acceptable. \nPlease adjust the name accordingly."
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
    "Error: This email address is already being used for a #{name} account." \
    "Please choose a different email address for precisionFDA."
  end
end

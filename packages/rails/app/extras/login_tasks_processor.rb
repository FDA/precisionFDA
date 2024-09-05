# Responsible for executing user login tasks.
class LoginTasksProcessor
  include OrgService::Errors
  include OrgService::RequestFilter
  include OrgService::BaselineCharges

  # Constructor.
  # @param leave_org_processor [OrgService::LeaveOrgProcess] Processor of leaving organization
  #   by user.
  def initialize(leave_org_processor)
    @leave_org_processor = leave_org_processor
  end

  # Invokes tasks for provided user.
  # @param user [User] User to process tasks for.
  # @param api [DNAnexusAPI] User API object.
  def call(user, api)
    process_org_leave_and_dissolve!(user)
    set_user_baseline_charges!(user, api)
  end

  private

  attr_reader :request

  # Process Org leaving and dissolving.
  # @param user [User] User to process tasks for.
  def process_org_leave_and_dissolve!(user)
    @user = user
    @request = find_request

    return unless @request
    return if admin_tries_to_leave_nonempty_org?

    process_org_leaving!
    process_org_dissolving! if org.admin == @user
  end

  # Checks if admin tries to leave non-empty organization.
  # @return [true, false] Returns true if user is an admin and admin tries to leave an org
  #   where there are other users except this admin.
  def admin_tries_to_leave_nonempty_org?
    org.admin == @user && org.users.count > 1
  end

  # Triggers organization leaving by user if corresponded request exists.
  def process_org_leaving!
    perform!
    resolve_remaining_requests!
  end

  # Triggers organization dissolving if corresponded request exists.
  def process_org_dissolving!
    org.reload

    dissolve_request = org.dissolve_org_action_request

    return if !dissolve_request&.approved? || admin_tries_to_leave_nonempty_org?

    ActiveRecord::Base.transaction do
      org.update!(admin: nil, state: "deleted")
      request_resolved!(dissolve_request)
    end
  end

  # @return [OrgActionRequest] Returns approved user request for org leaving, if any.
  def find_request
    filter_requests(@user, OrgActionRequest::State::APPROVED).first
  end

  # Performs main actions for user to leave an organization.
  def perform!
    ActiveRecord::Base.transaction do
      request_processing!(request)

      projects_map = @leave_org_processor.call(org, @user)

      request.update!(info: projects_map)

      request_resolved!(request)
    end
  rescue AdminIsNotLastInOrgError => e
    Rails.logger.warn([e.message, e.backtrace.join("\n")].join("\n"))
  end

  # Resolves remaining requests.
  def resolve_remaining_requests!
    filter_requests(@user, [
      OrgActionRequest::State::NEW,
      OrgActionRequest::State::APPROVED,
    ]).each do |request|
      request_resolved!(request)
    end
  end

  # Updates request's state to processing.
  def request_processing!(request)
    request.update!(state: OrgActionRequest::State::PROCESSING)
  end

  # Updates request's state to resolved.
  def request_resolved!(request)
    request.update!(state: OrgActionRequest::State::RESOLVED)
  end

  delegate :org, to: :request
end

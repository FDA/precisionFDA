module OrgService
  # Responsible for dissolve org request approval.
  class DissolveOrgApprove < LeaveOrgApprove
    def initialize(admin, mailer, leave_org_request_creator)
      super(admin, mailer)

      @leave_org_request_creator = leave_org_request_creator
    end

    private

    # Creates action request.
    def approve_request!
      super

      create_requests_for_users!

      NotificationsMailer.org_dissolve_approved_email(@request.org, @admin).deliver_now!
    end

    # Create leaving requests for each org member
    def create_requests_for_users!
      org = @request.org

      org.users.each do |user|
        if pending_requests_exist?(user)
          approve_pending_requests!(user)
          next
        end

        leave_request = @leave_org_request_creator.
          call(org, user, OrgActionRequest::Type::LEAVE_ON_DISSOLVE)
        approve!(leave_request)
      end
    end

    # Checks if leaving request already exists.
    # @param user [User] User to check the request from.
    # @return [true, false] If request is exist, false otherwise.
    def pending_requests_exist?(user)
      filter_requests(user, OrgActionRequest::State::NEW).present?
    end
  end
end

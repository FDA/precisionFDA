module OrgService
  # Responsible for leave org request approval.
  class LeaveOrgApprove
    include OrgService::RequestFilter

    # Constructor.
    # @param admin [User] FDA admin.
    def initialize(admin, mailer)
      @admin = admin
      @mailer = mailer
      @request = nil
    end

    # Creates correspondent request if user can be removed from org.
    # @param request [OrgActionRequest] Request to approve.
    # @return [true] If request was updated, raises error otherwise.
    def call(request)
      @request = request

      check_admin!
      check_request_state!
      approve_request!

      if request.remove_member?
        @mailer.user_remove_approved_email(@request.org, @request.member, @admin).deliver_now!
      elsif request.leave?
        @mailer.user_leave_approved_email(@request.org, @request.initiator, @admin).deliver_now!
      end
    end

    private

    # Checks if provided admin is FDA admin.
    # @raise [RuntimeError] If admin is not FDA admin.
    def check_admin!
      raise "Only FDA admin can approve requests" unless @admin.can_administer_site?
    end

    # Checks request state and raises error if status is invalid.
    # @raise [RuntimeError] If request state is invalid.
    def check_request_state!
      raise "Invalid request status" unless @request.new?
    end

    # Creates action request.
    # @see #ActiveRecord::Persistence.update!
    def approve_request!
      approve!(@request)
    end

    # Approves provided request.
    # @param request [OrgActionRequest] Request to be approved.
    def approve!(request)
      request.update!(
        state: OrgActionRequest::State::APPROVED,
        approver: @admin,
        approved_at: Time.now,
      )
    end

    def approve_pending_requests!(user)
      filter_requests(user, OrgActionRequest::State::NEW).each do |request|
        request.update!(
          state: OrgActionRequest::State::APPROVED,
          approver: @admin,
          approved_at: Time.now,
        )
      end
    end
  end
end

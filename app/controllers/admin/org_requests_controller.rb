module Admin
  # Responsible for organization-related requests actions.
  class OrgRequestsController < BaseController
    before_action :find_request, only: %i(approve)

    # List of action requests.
    def index
      @requests_grid = initialize_grid(
        OrgActionRequest.joins(:org, :initiator).order(created_at: :desc),
      )
    end

    # Approves user's request.
    def approve
      if @request.dissolve?
        approve_dissolve_request
      elsif @request.leave? || @request.remove_member?
        approve_leave_request
      else
        raise "Unknown request type"
      end

      flash[:success] = "Request successfully approved"
    end

    private

    # Approves leave request.
    def approve_leave_request
      OrgService::LeaveOrgApprove.new(@context.user, NotificationsMailer).call(@request)
    end

    # Approves dissolve request.
    def approve_dissolve_request
      OrgService::DissolveOrgApprove.new(
        @context.user,
        NotificationsMailer,
        container.resolve("orgs.leave_org_request_creator"),
      ).call(@request)
    end

    # Finds request.
    def find_request
      @request = OrgActionRequest.find(params[:id])
    end
  end
end

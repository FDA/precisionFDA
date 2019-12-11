module OrgService
  # Shared module for requests filtering.
  module RequestFilter
    # Returns user's remaining requests to be resolved.
    # @param user [User] User to filter requests for.
    # @param request_state [String, Array<String>] State(s) to filter requests by.
    # @return [ActiveRecord::Relation<OrgActionRequest>] Relation of remaining requests.
    def filter_requests(user, request_state)
      OrgActionRequest.where(
        state: request_state,
      ).merge(
        OrgActionRequest.where(
          initiator: user,
          action_type: [
            OrgActionRequest::Type::LEAVE,
            OrgActionRequest::Type::LEAVE_ON_DISSOLVE,
          ],
        ).or(
          OrgActionRequest.where(
            member: user,
            action_type: OrgActionRequest::Type::REMOVE_MEMBER,
          ),
        ),
      )
    end
  end
end

module OrgService
  # Responsible for creating request for user to leave an org.
  class LeaveOrgRequest
    # Constructor.
    # @param policy [#satisfied?] Client API.
    def initialize(policy)
      @policy = policy
      @org = nil
      @user = nil
      @action_type = nil
    end

    # Creates correspondent request if user can be removed from org.
    # @param org [Org] Organization to remove user from.
    # @param user [User] User to remove from the organization.
    # @param action_type [String] Leave action type.
    # @return [OrgActionRequest] Created action request.
    def call(org, user, action_type = OrgActionRequest::Type::LEAVE)
      @org = org
      @user = user
      @action_type = action_type

      check_membership!
      check_request!
      create_request!
    end

    private

    # Checks membership restrictions and raises error if one of them is violated.
    # @raise [StandardError] If removal policy is not satisfied.
    def check_membership!
      raise "Unable to remove user from org" unless @policy.satisfied?(@org, @user)
    end

    # Checks if corresponded request was already created.
    # @raise [RuntimeError] If request already exists.
    def check_request!
      request = OrgActionRequest.find_by(
        initiator: @user,
        org: @org,
        action_type: @action_type,
      )

      raise "Request already exists" if request
    end

    # Creates action request.
    # @return [OrgActionRequest] Created request.
    def create_request!
      OrgActionRequest.create!(
        initiator: @user,
        org: @org,
        action_type: @action_type,
        state: OrgActionRequest::State::NEW,
      )
    end
  end
end

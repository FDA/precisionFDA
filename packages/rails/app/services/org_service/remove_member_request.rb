module OrgService
  # Responsible for creating request for user to leave an org.
  class RemoveMemberRequest
    # Constructor.
    # @param policy [#satisfied?] Client API.
    # TODO: provide request type as additional argument
    def initialize(policy)
      @policy = policy
      @org = nil
      @user = nil
      @member = nil
    end

    # Creates correspondent request if user can be removed from org.
    # @param org [Org] Organization to remove user from.
    # @param user [User] User to remove from the organization.
    # @return [OrgActionRequest] Created action request.
    def call(org, user, member)
      @org = org
      @user = user
      @member = member

      check_membership!
      check_request!
      create_request!
    end

    private

    # Checks membership restrictions and raises error if one of them is violated.
    # @raise [StandardError] If removal policy is not satisfied.
    def check_membership!
      raise "Unable to remove user from org" unless @policy.satisfied?(@org, @member)
    end

    # Checks if corresponded request was already created.
    # @raise [RuntimeError] If request already exists.
    def check_request!
      request = OrgActionRequest.find_by(
        initiator: @user,
        org: @org,
        member: @member,
        action_type: OrgActionRequest::Type::REMOVE_MEMBER,
      )

      raise "Request already exists" if request
    end

    # Creates action request.
    # @return [OrgActionRequest] Created request.
    def create_request!
      OrgActionRequest.create!(
        initiator: @user,
        org: @org,
        member: @member,
        action_type: OrgActionRequest::Type::REMOVE_MEMBER,
        state: OrgActionRequest::State::NEW,
      )
    end
  end
end

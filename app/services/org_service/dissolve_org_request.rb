module OrgService
  # Responsible for creating request for org to dissolve
  class DissolveOrgRequest
    attr_reader :policy

    # Constructor.
    # @param policy [#satisfied?] Policy that checks if org can be dissolved.
    def initialize(policy)
      @policy = policy
      @user = nil
      @org = nil
    end

    # Creates correspondent request if org can be dissolved.
    # @param org [Org] Organization to dissolve.
    # @param user [User] User that initiates an org dissolving.
    # @return [OrgActionRequest] Created action request.
    def call(org, user)
      @org = org
      @user = user

      check_membership!
      create_request!
    end

    private

    attr_reader :user, :org

    # Checks membership restrictions and raises error if one of them is violated.
    # @raise [StandardError] If removal policy is not satisfied.
    def check_membership!
      raise "Unable to dissolve the org" unless policy.satisfied?(org, user)
    end

    # Creates action request.
    # @return [OrgActionRequest] Created request.
    def create_request!
      OrgActionRequest.create!(
        initiator: user,
        org: org,
        action_type: OrgActionRequest::Type::DISSOLVE,
        state: OrgActionRequest::State::NEW,
      )
    end
  end
end

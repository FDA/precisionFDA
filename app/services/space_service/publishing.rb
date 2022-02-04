# This Service contains a logic used in Spaces
module SpaceService
  # A logic providing publishing into spaces
  class Publishing
    def initialize(context)
      @context = context
    end

    # Check that scope is a valid scope and determine a space, where to publish:
    # - must be of the form space-xxxx;
    # - must exist in the Space table;
    # - must be accessible by context.
    # @param scope_to_check [String]
    # @return [Hash] contains a scope have been checked and a space object
    #
    def scope_check(scope_to_check)
      space = nil
      scope = scope_to_check
      if scope.blank?
        scope = "public"
      elsif scope.is_a?(String)
        if scope != "public"
          raise "Publish route called with invalid scope #{scope}" unless Space.valid_scope?(scope)
          space = Space.find_by(id: Space.scope_id(scope))
          useful_space = space.present? && space.active? && space.accessible_by?(context)
          raise "Publish route called with invalid space #{scope}" unless useful_space

        end
      else
        raise "Publish route called with invalid scope #{scope.inspect}"

      end
      { scope: scope, space: space }
    end

    private

    attr_reader :context
  end
end

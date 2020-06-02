module Api
  # Space requests controller.
  class SpaceRequestsController < ApiController
    # POST /api/spaces/:id/lock
    def lock
      head(:forbidden) && return unless SpaceRequestPolicy.can_lock?(current_user, space)

      Space.transaction do
        space.locked!
        space.confidential_spaces.each(&:locked!)
        SpaceEventService.call(space.id, @context.user_id, membership, space, :space_locked)
      end

      render json: space, adapter: :json
    end

    # POST /api/spaces/:id/unlock
    def unlock
      head(:forbidden) && return unless SpaceRequestPolicy.can_unlock?(current_user, space)

      Space.transaction do
        space.active!
        space.confidential_spaces.each(&:active!)
        SpaceEventService.call(space.id, @context.user_id, membership, space, :space_unlocked)
      end

      render json: space, adapter: :json
    end

    # POST /api/spaces/:id/delete
    def delete
      head(:forbidden) && return unless SpaceRequestPolicy.can_delete?(current_user, space)

      Space.transaction { SpaceService::Delete.call(space, membership) }

      head :ok
    end

    private

    # Finds a shared space.
    # @return [Space] A space.
    def space
      @space ||= Space.shared.find(params[:id])
    end

    # Creates current user's space membership with an ADMIN role.
    # @return [SpaceMembership] A space membership.
    def membership
      @membership ||= SpaceMembership.new_by_admin(current_user)
    end
  end
end

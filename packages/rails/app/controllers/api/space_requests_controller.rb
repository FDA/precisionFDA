module Api
  # Space requests controller.
  class SpaceRequestsController < ApiController

    # POST /api/spaces/:id/lock
    def lock

      https_apps_client.lock_space(space.id)
      render json: space, adapter: :json
    end

    # POST /api/spaces/:id/unlock
    def unlock

      https_apps_client.unlock_space(space.id)
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

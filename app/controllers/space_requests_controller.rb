class SpaceRequestsController < ApplicationController

  def lock
    if SpaceRequestPolicy.can_lock?(current_user, space)
      Space.transaction do
        space.locked!
        space.confidential_spaces.each(&:locked!)
        SpaceEventService.call(space.id, @context.user_id, membership, space, :space_locked)
      end
    end

    redirect_to spaces_path
  end

  def unlock
    if SpaceRequestPolicy.can_unlock?(current_user, space)
      Space.transaction do
        space.active!
        space.confidential_spaces.each(&:active!)
        SpaceEventService.call(space.id, @context.user_id, membership, space, :space_unlocked)
      end
    end

    redirect_to spaces_path
  end

  def delete
    if SpaceRequestPolicy.can_delete?(current_user, space)
      Space.transaction do
        SpaceService::Delete.call(space, membership)
      end
    end

    redirect_to spaces_path
  end

  private

  def space
    @space ||= Space.shared.accessible_by(@context).find_by!(id: params[:id])
  end

  def membership
    SpaceMembership.new_by_admin(current_user)
  end
end

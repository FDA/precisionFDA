class SpaceRequestsController < ApplicationController

  def lock
    if SpaceRequestPolicy.can_lock?(current_user, space)
      Space.transaction do
        space.locked!
        space.confidential_spaces.each(&:locked!)

        space.space_memberships.subscribed_to(:space_lock_unlock_delete).each do |member|
          ReviewSpaceMailer.unlock_email(space, @context.user, member).deliver_now!
        end

      end
    end

    redirect_to spaces_path
  end

  def unlock
    if SpaceRequestPolicy.can_unlock?(current_user, space)
      Space.transaction do
        space.active!
        space.confidential_spaces.each(&:active!)
        NotificationsMailer.sponsor_unlock_email(space, @context.user).deliver_now!
      end
    end

    redirect_to spaces_path
  end

  private

  def space
    @space ||= Space.shared.accessible_by(@context).find_by!(id: params[:id])
  end
end

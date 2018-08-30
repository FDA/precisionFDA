class SpaceRequestsController < ApplicationController

  def request_lock
    unless space.active?
      redirect_to spaces_path
      return
    end

    SpaceRequest.transaction do
      space.requests.lock_up.create(user_id: @context.user_id)
      NotificationsMailer.space_request_lock_email(space, admin).deliver_now!
    end

    redirect_to space
  end

  def confirm_lock
    if !@context.review_space_admin? || !space.active?
      redirect_to spaces_path
      return
    end

    Space.transaction do
      space.locked!
      space.confidential_spaces.each(&:locked!)
      space.requests.lock_up.pending.each(&:completed!)
    end

    redirect_to space
  end

  def request_unlock
    unless space.locked?
      redirect_to spaces_path
      return
    end

    SpaceRequest.transaction do
      space.requests.unlock.create(user_id: @context.user_id)
      NotificationsMailer.space_request_unlock_email(space, admin).deliver_now!
    end

    redirect_to space
  end

  def confirm_unlock
    if !@context.review_space_admin? || !space.locked?
      redirect_to spaces_path
      return
    end

    Space.transaction do
      space.active!
      space.private_spaces.each(&:active!)
      space.requests.unlock.pending.each(&:completed!)
      NotificationsMailer.sponsor_unlock_email(space, @context.user).deliver_now! if confirm_unlock_params[:sponsor_notification] == "1"
    end

    redirect_to space
  end

  def reject_unlock
    if !@context.review_space_admin? || !space.locked?
      redirect_to spaces_path
      return
    end

    space.requests.unlock.pending.each(&:rejected!)
    redirect_to space
  end

  private

  def space
    @space ||= Space.shared.accessible_by(@context).find_by!(id: params[:id])
  end

  def admin
    @admin ||= space.space_memberships.active.lead.find_by!(user_id: @context.user_id)
  end

  def confirm_unlock_params
    params.require(:request).permit(:sponsor_notification)
  end
end

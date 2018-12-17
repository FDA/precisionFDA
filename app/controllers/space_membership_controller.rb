class SpaceMembershipController < ApplicationController

  def to_lead
    member.with_lock do
      if SpaceMembershipService::ToLead.call(api, space, member, admin_member)
        flash[:success] = "#{member.user.full_name} was successfully designated as lead"
      end
    end

    redirect_to :back
  end

  def to_admin
    member.with_lock do
      if SpaceMembershipService::ToAdmin.call(api, space, member, admin_member)
        flash[:success] = "#{member.user.full_name} was successfully designated as admin"
      end
    end

    redirect_to :back
  end

  def to_member
    member.with_lock do
      if SpaceMembershipService::ToMember.call(api, space, member, admin_member)
        flash[:success] = "#{member.user.full_name} was successfully designated as member"
      end
    end

    redirect_to :back
  end

  def to_viewer
    member.with_lock do
      if SpaceMembershipService::ToViewer.call(api, space, member, admin_member)
        flash[:success] = "#{member.user.full_name} was successfully designated as viewer"
      end
    end

    redirect_to :back
  end

  def to_inactive
    member.with_lock do
      if SpaceMembershipService::ToInactive.call(api, space, member, admin_member)
        flash[:success] = "#{member.user.full_name} was successfully disabled"
      end
    end

    redirect_to :back
  end

  private

  def member
    @member ||= SpaceMembership.find_by_id!(params[:id])
  end

  def api
    if @context.review_space_admin? && admin_member.new_record?
      DNAnexusAPI.for_admin
    else
      @context.api
    end
  end

  def admin_member
    if @context.review_space_admin? && member.host?
      SpaceMembership.new_by_admin(current_user)
    else
      SpaceMembership.lead_or_admin.find_by!(user_id: current_user)
    end
  end

  def space
    @space ||= member.spaces.find_by!({})
  end

end

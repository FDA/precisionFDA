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

  def to_contributor
    member.with_lock do
      if SpaceMembershipService::ToContributor.call(api, space, member, admin_member)
        flash[:success] = "#{member.user.full_name} was successfully designated as contributor"
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

  def admin_member
    @admin_member ||= space.space_memberships.lead_or_admin.find_by!(user: current_user)
  end

  def space
    @space ||= member.spaces.find_by!({})
  end

  def api
    @context.api
  end
end

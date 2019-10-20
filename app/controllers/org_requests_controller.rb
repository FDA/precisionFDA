class OrgRequestsController < ApplicationController
  def create_leave
    org = Org.find(params[:id])
    service = container.resolve("orgs.leave_org_request_creator")
    service.call(org, @context.user)
  end

  def remove_member
    org = Org.find(params[:org_id])
    member = org.users.find(params[:user_id])
    service = container.resolve("orgs.remove_member_request_creator")
    service.call(org, @context.user, member)

    redirect_to profile_path
  end

  def create_dissolve
    org = Org.find(params[:id])
    service = container.resolve("orgs.dissolve_org_request_creator")
    service.call(org, @context.user)
  end
end

module OrgRequestsHelper
  def action_type(request)
    if request.leave_on_dissolve?
      "Leave due to organization dissolve"
    elsif request.remove_member?
      "Remove member from organization"
    elsif request.leave?
      "Leave organization"
    elsif request.dissolve?
      "Dissolve organization"
    else
      request.action_type.humanize
    end
  end
end

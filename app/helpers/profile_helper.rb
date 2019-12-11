module ProfileHelper
  def countries
    Country.pluck(:name, :id)
  end

  def dial_codes
    Country.dial_codes
  end

  def user_org_admin?
    return false if @context.guest?
    current_user.id == current_user.org.admin_id
  end

  # Checks if current user has created organization leave (or leave on dissolve) request.
  # @return [true, false] Returns true if user has created organization leave request,
  #   false otherwise.
  def active_leave_org_request_present?
    return false if @context.guest?

    current_user.active_leave_org_request.present?
  end

  def leave_org_label
    leave = current_user.active_leave_org_request

    if leave.nil?
      "Leave organization"
    elsif leave.new?
      "Pending approval for organization leaving"
    elsif leave.approved?
      "Leaving is approved"
    end
  end

  # @return [String] Returns dissolve button text
  def dissolve_org_btn_text
    dissolve_request = current_user.org.dissolve_org_action_request

    if dissolve_request.nil?
      "Dissolve organization"
    elsif dissolve_request.new?
      "Pending approval for organization dissolving"
    elsif dissolve_request.approved?
      "Dissolving is approved"
    end
  end

  # @return [true, false] Returns true if dissolve button should be shown,
  #   false otherwise.
  def dissolve_button_shown?
    [
      OrgActionRequest::State::APPROVED,
      OrgActionRequest::State::NEW,
      nil
    ].include?(current_user.org.dissolve_org_action_request&.state)
  end

  def active_remove_member_request_present?(member)
    OrgActionRequest.exists?(
      member: member,
      action_type: OrgActionRequest::Type::REMOVE_MEMBER,
    )
  end

  def remove_member_label(member)
    remove_request = OrgActionRequest.find_by(
      member: member,
      action_type: OrgActionRequest::Type::REMOVE_MEMBER
    )

    if remove_request.new?
      "Pending approval for member removing"
    elsif remove_request.approved?
      "Removing is approved"
    end
  end

  def user_exists_attribute(invitation, attribute)
    if invitation.user
      User.user_helper_attribute(invitation.user_id, attribute)
    else
      invitation[attribute]
    end
  end
end

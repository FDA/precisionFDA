# Space Edit Form model, used for space editing.
class SpaceEditForm < SpaceForm
  include ActiveModel::Model

  attr_accessor(
    :space_host_lead,
    :space_guest_lead,
    :current_user,
  )

  validates :name, :description, :space_type, presence: true
  validate :validate_host_lead_dxuser
  validate :validate_sponsor_lead_dxuser, if: -> { space_type == TYPE_REVIEW }

  alias_method :reviewer_lead_dxuser, :host_lead_dxuser

  private

  # A host lead user validation
  # Prevents a reviewer lead to set the sponsor lead as the reviewer lead
  def validate_host_lead_dxuser
    errors.add(:reviewer_lead_dxuser, "'#{host_lead_dxuser}' not found") unless host_admin

    check_dxuser_already_in_space(host_lead_dxuser) if host_lead_dxuser != space_host_lead

    return unless host_lead_dxuser == space_guest_lead

    errors.add(:sponsor_lead_dxuser, "can't be assigned as Reviewer lead")
  end

  # A sponsor lead user validation.
  # Prevents a reviewer lead to set himself as the sponsor lead
  def validate_sponsor_lead_dxuser
    if sponsor_lead_dxuser == host_lead_dxuser
      errors.add(:sponsor_lead_dxuser, "can't be the same as Reviewer lead")
    end

    if sponsor_lead_dxuser == space_host_lead
      errors.add(:reviewer_lead_dxuser, "can't be assigned as Sponsor lead")
    end
    errors.add(:sponsor_lead_dxuser, "'#{sponsor_lead_dxuser}' not found") unless space_sponsor

    check_dxuser_already_in_space(sponsor_lead_dxuser) if sponsor_lead_dxuser != space_guest_lead
  end

  def check_dxuser_already_in_space(dxuser)
    space = Space.find(source_space_id)
    return if space.user_member(dxuser).blank?

    errors.add(
      :base,
      "The Space member #{dxuser} exists." \
      " Use `Members` page to change the role",
    )
  end
end

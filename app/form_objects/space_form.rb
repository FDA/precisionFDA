# Provide a new space template data on space creation with validations.
# Validation methods create Active Model Validations +Errors+ objects.
#   that holds all information about attribute.
# According to Org deprecation:
#   Sponsor Lead field in space form is implemented and
#     requires a user ID rather than an org handle.
#   Validation methods adjusted accordingly.
#
class SpaceForm
  include ActiveModel::Model

  attr_accessor(
    :name,
    :description,
    :host_lead_dxuser,
    :guest_lead_dxuser,
    :space_type,
    :cts,
    :sponsor_org_handle,
    :sponsor_lead_dxuser,
    :space_template_id,
    :restrict_to_template,
  )

  TYPE_GROUPS = "groups".freeze
  TYPE_REVIEW = "review".freeze
  TYPE_VERIFICATION = "verification".freeze

  validates :name, :description, :space_type, presence: true
  validate :validate_host_lead_dxuser
  validate :validate_leads_orgs, if: -> { space_type == TYPE_REVIEW }
  validate :validate_guest_lead_dxuser, if: -> { space_type.in?([TYPE_GROUPS, TYPE_VERIFICATION]) }
  validate :validate_sponsor_lead_dxuser, if: -> { space_type == TYPE_REVIEW }

  def self.model_name
    Space.model_name
  end

  def space_templates(context)
    SpaceTemplate.private_first(context)
  end

  def persist!(api, user)
    SpaceService::Create.call(self, api: api, user: user)
  end

  def space_sponsor
    User.find_by(dxuser: sponsor_lead_dxuser)
  end

  private

  # A host lead user validation
  def validate_host_lead_dxuser
    errors.add(:host_lead_dxuser, "'#{host_lead_dxuser}' not found") unless host_admin
  end

  # A guest lead user validation
  def validate_guest_lead_dxuser
    if guest_lead_dxuser == host_lead_dxuser
      errors.add(:guest_lead_dxuser, "can't be the same as Host lead")
    end

    return unless guest_lead_in_groups || guest_lead_in_verification

    errors.add(:guest_lead_dxuser, "'#{guest_lead_dxuser}' not found")
  end

  # Check guest lead in space of "groups" type
  def guest_lead_in_groups
    space_type == "groups" && !(guest_lead_dxuser.present? && guest_admin)
  end

  # Check guest lead in space of "verification" type
  def guest_lead_in_verification
    space_type == "verification" && guest_lead_dxuser.present? && guest_admin.nil?
  end

  # A sponsor lead user validation
  def validate_sponsor_lead_dxuser
    if sponsor_lead_dxuser == host_lead_dxuser
      errors.add(:sponsor_lead_dxuser, "can't be the same as Reviewer lead")
    end

    errors.add(:sponsor_lead_dxuser, "'#{sponsor_lead_dxuser}' not found") unless space_sponsor
  end

  # Validation of host admin and space sponsor orgs:
  #   both admins should not be in the same Org.
  def validate_leads_orgs
    return unless space_sponsor && host_admin

    return unless space_sponsor.org_id == host_admin.org_id

    errors.add(:sponsor_lead_dxuser, "can't belong to the same Org as Reviewer lead")
  end

  def host_admin
    User.find_by(dxuser: host_lead_dxuser)
  end

  def guest_admin
    User.find_by(dxuser: guest_lead_dxuser)
  end
end

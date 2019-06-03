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
    :space_template_id,
    :restrict_to_template
  )

  validates :name, :description, :space_type, presence: true
  validate :validate_host_lead_dxuser
  validate :validate_guest_lead_dxuser,
    if: -> { space_type.in?(%w(groups verification)) && guest_lead_dxuser.present? }
  validate :validate_sponsor_org, if: -> { space_type == "review" }

  def self.model_name
    Space.model_name
  end

  def space_templates(context)
    SpaceTemplate.private_first(context)
  end

  def persist!(api, user)
    SpaceService::Create.call(self, api: api, user: user)
  end

  def sponsor_org
    Org.find_by(handle: sponsor_org_handle)
  end

  private

  def validate_host_lead_dxuser
    errors.add(:host_lead_dxuser, "'#{host_lead_dxuser}' not found") unless host_admin
  end

  def validate_guest_lead_dxuser
    errors.add(:guest_lead_dxuser, "'#{guest_lead_dxuser}' not found") unless guest_admin

    if guest_lead_dxuser == host_lead_dxuser
      errors.add(:guest_lead_dxuser, "can't be the same as Host lead")
    end
  end

  def validate_sponsor_org
    errors.add(:sponsor_org_handle, "'#{sponsor_org_handle}' not found") unless sponsor_org
  end

  def host_admin
    User.find_by(dxuser: host_lead_dxuser)
  end

  def guest_admin
    User.find_by(dxuser: guest_lead_dxuser)
  end
end

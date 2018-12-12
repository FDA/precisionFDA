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
  validate :validate_guest_lead_dxuser, if: -> { space_type == 'groups' || space_type == 'verification' }
  validate :validate_sponsor_org, if: -> { space_type == 'review' }

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
    if host_admin.blank?
      errors.add(:host_lead_dxuser, "'#{host_lead_dxuser}' not found")
    end
  end

  def validate_guest_lead_dxuser
    return unless space_type == 'groups'

    if guest_admin.blank?
      errors.add(:host_lead_dxuser, "'#{guest_lead_dxuser}' not found")
    end
    if guest_lead_dxuser == host_lead_dxuser
      errors.add(:guest_lead_dxuser, "can't be the same as Host lead")
    end
  end

  def validate_sponsor_org
    if sponsor_org.blank?
      errors.add(:sponsor_org_handle, "'#{sponsor_org_handle}' not found")
    end
  end

  def host_admin
    User.find_by(dxuser: host_lead_dxuser)
  end

  def guest_admin
    User.find_by(dxuser: guest_lead_dxuser)
  end

end

# Custom Challenge serializer used in edit challenge form.
class CustomChallengeSerializer < ApplicationSerializer
  attributes(
    :id,
    :name,
    :description,
    :meta,
    :start_at,
    :end_at,
    :created_at,
    :updated_at,
    :status,
    :card_image_url,
    :card_image_id,
    :pre_registration_url,
    :host_lead_dxuser,
    :guest_lead_dxuser,
    :scope,
    :app_owner_id,
  )

  def host_lead_dxuser
    object.space.host_lead_dxuser
  end

  def guest_lead_dxuser
    object.space.guest_lead_dxuser
  end

  def app_owner_id
    [object.app_owner.select_text, object.app_owner.id]
  end

  def scope
    object.scope
  end
end

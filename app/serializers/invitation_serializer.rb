# Serializes invitation
class InvitationSerializer
  # Serializes invitation.
  # @param invitation [Invitation] Invitation to serialize.
  # @return [Hash] Serialized invitation.
  def self.call(invitation)
    {
      id: invitation.id,
      first_name: invitation.first_name,
      last_name: invitation.last_name,
      email: invitation.email,
      address1: invitation.address1,
      address2: invitation.address2,
      country_name: invitation.country.name,
      country_id: invitation.country.id,
      city: invitation.city,
      us_state: invitation.us_state,
      postal_code: invitation.postal_code,
      phone: invitation.full_phone,
      duns: invitation.duns,
      created_at: invitation.created_at.strftime("%Y-%m-%d %H:%M"),
      organize_intent: invitation.organize_intent,
      participate_intent: invitation.participate_intent,
    }
  end
end

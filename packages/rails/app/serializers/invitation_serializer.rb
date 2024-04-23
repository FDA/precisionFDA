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
      duns: invitation.duns,
      created_at: invitation.created_at.strftime("%Y-%m-%d %H:%M"),
      organize_intent: invitation.organize_intent,
      participate_intent: invitation.participate_intent,
    }
  end
end

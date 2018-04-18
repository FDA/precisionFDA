class Event::UserAccessRequested < Event
  alias_attribute :invitation_id, :param1

  def self.create_for(invitation)
    create(
      invitation_id: invitation.id
    )
  end
end

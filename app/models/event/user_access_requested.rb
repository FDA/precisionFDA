class Event::UserAccessRequested < Event

  event_attribute :invitation_id, db_column: :param1

  def self.create(invitation)
    super(
      invitation_id: invitation.id
    )
  end

end

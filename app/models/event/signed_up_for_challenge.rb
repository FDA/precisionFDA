class Event::SignedUpForChallenge < Event

  event_attribute :challenge_id, db_column: :param1
  event_attribute :dxuser
  event_attribute :org_handle

  def self.create(challenge, user)
    super(
      challenge_id: challenge.id,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end

end

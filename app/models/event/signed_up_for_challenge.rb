class Event::SignedUpForChallenge < Event
  alias_attribute :challenge_id, :param1

  def self.create_for(challenge, user)
    create(
      challenge_id: challenge.id,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end
end

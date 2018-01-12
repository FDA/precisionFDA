class Event::UserLoggedIn < Event

  event_attribute :dxuser
  event_attribute :org_handle

  def self.create(user)
    super(
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end

end

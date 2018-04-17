class Event::UserLoggedIn < Event
  def self.create_for(user)
    create(
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end
end

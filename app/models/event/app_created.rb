class Event::AppCreated < Event
  alias_attribute :dxid, :param1

  def self.create_for(app, user)
    create(
      dxid: app.dxid,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end
end

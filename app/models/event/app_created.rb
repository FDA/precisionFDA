class Event::AppCreated < Event

  event_attribute :dxid, db_column: :param1
  event_attribute :dxuser
  event_attribute :org_handle

  def self.create(app, user)
    super(
      dxid: app.dxid,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end

end

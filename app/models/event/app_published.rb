class Event::AppPublished < Event

  event_attribute :dxid, db_column: :param1
  event_attribute :scope, db_column: :param2
  event_attribute :dxuser
  event_attribute :org_handle

  def self.create(app, scope, user)
    super(
      dxid: app.dxid,
      scope: scope,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end

end

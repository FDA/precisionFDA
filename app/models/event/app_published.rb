class Event::AppPublished < Event
  alias_attribute :dxid, :param1
  alias_attribute :scope, :param2

  def self.create_for(app, scope, user)
    create(
      dxid: app.dxid,
      scope: scope,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end
end

class Event::FileDeleted < Event
  alias_attribute :file_size, :param1
  alias_attribute :dxid, :param2
  alias_attribute :scope, :param3

  def self.create_for(file, user)
    create(
      dxid: file.dxid,
      file_size: file.file_size,
      scope: file.scope,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end
end

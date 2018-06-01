class Event::FileDownloaded < Event
  alias_attribute :file_size, :param1
  alias_attribute :dxid, :param2

  def self.create_for(file, user)
    create(
      dxid: file.dxid,
      file_size: file.file_size,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end
end

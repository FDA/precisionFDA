class Event::FileCreated < Event
  alias_attribute :file_size, :param1
  alias_attribute :dxid, :param2
  alias_attribute :parent_type, :param3

  scope :with_parent_type_user, -> { where(param3: "User") }
  scope :with_parent_type_job, -> { where(param3: "Job") }

  def self.create_for(file, user)
    create(
      dxid: file.dxid,
      file_size: file.file_size,
      parent_type: file.parent_type,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end
end

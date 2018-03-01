class Event::FileCreated < Event

  event_attribute :file_size, db_column: :param1
  event_attribute :dxid, db_column: :param2
  event_attribute :parent_type, db_column: :param3
  event_attribute :dxuser
  event_attribute :org_handle

  scope :with_parent_type_user, -> { where(param3: "User") }
  scope :with_parent_type_job, -> { where(param3: "Job") }

  def self.create(file, user)
    super(
      dxid: file.dxid,
      file_size: file.file_size,
      parent_type: file.parent_type,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end

end

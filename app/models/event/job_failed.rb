class Event::JobFailed < Event

  event_attribute :dxid, db_column: :param1
  event_attribute :dxuser
  event_attribute :org_handle

  def self.create(job, user)
    super(
      dxid: job.dxid,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end

end

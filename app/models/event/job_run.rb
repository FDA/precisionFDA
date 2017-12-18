class Event::JobRun < Event

  event_attribute :dxid, db_column: :param1
  event_attribute :app_dxid, db_column: :param2
  event_attribute :dxuser
  event_attribute :org_handle

  def self.create(job, user)
    super(
      dxid: job.dxid,
      app_dxid: job.app.dxid,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end

end

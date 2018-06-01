class Event::JobRun < Event
  alias_attribute :dxid, :param1
  alias_attribute :app_dxid, :param2

  def self.create_for(job, user)
    create(
      dxid: job.dxid,
      app_dxid: job.app.dxid,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end
end

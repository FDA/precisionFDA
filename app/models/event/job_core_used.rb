class Event::JobCoreUsed < Event

  event_attribute :dxid, db_column: :param1
  event_attribute :runtime, db_column: :param2
  event_attribute :price, db_column: :param3
  event_attribute :dxuser
  event_attribute :org_handle

  def self.create(job, user)
    super(
      dxid: job.dxid,
      runtime: job.runtime,
      price: job.describe["totalPrice"],
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end

end

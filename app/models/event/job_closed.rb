class Event::JobClosed < Event

  event_attribute :dxid, db_column: :param1
  event_attribute :runtime, db_column: :param2
  event_attribute :price, db_column: :param3
  event_attribute :state, db_column: :param4
  event_attribute :dxuser
  event_attribute :org_handle

  scope :failed, -> { where(param4: Job::STATE_FAILED) }

  def self.create(job, user)
    return unless job.terminal?

    super(
      dxid: job.dxid,
      runtime: job.runtime,
      price: job.describe["totalPrice"],
      state: job.state,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end

end

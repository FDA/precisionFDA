class Event::JobClosed < Event
  alias_attribute :dxid, :param1
  alias_attribute :runtime, :param2
  alias_attribute :price, :param3
  alias_attribute :state, :param4

  scope :failed, -> { where(state: Job::STATE_FAILED) }

  def self.create_for(job, user)
    return unless job.terminal?

    create(
      dxid: job.dxid,
      runtime: job.runtime,
      price: job.describe["totalPrice"],
      state: job.state,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end
end

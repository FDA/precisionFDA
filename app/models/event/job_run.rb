# == Schema Information
#
# Table name: events
#
#  id         :integer          not null, primary key
#  type       :string(255)
#  org_handle :string(255)
#  dxuser     :string(255)
#  param1     :string(255)
#  param2     :string(255)
#  param3     :string(255)
#  created_at :datetime         not null
#  param4     :string(255)
#

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

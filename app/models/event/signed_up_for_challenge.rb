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
#  data       :text(65535)
#

class Event::SignedUpForChallenge < Event
  alias_attribute :challenge_id, :param1

  def self.create_for(challenge, user)
    create(
      challenge_id: challenge.id,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end
end

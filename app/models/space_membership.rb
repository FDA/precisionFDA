# == Schema Information
#
# Table name: space_memberships
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  space_id   :integer
#  role       :string
#  side       :string
#  meta       :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class SpaceMembership < ActiveRecord::Base
  belongs_to :user
  belongs_to :space, dependent: :destroy

  store :meta, {coder: JSON}

  def self.admins
    where(role: "ADMIN")
  end

  def self.non_admins
    where(role: "MEMBER")
  end

  def self.hosts
    where(side: "HOST")
  end

  def self.guests
    where(side: "GUEST")
  end

  def admin?
    role == "ADMIN"
  end

  def host?
    side == "HOST"
  end

  def guest?
    side == "GUEST"
  end

  def project
    if host?
      space.host_project
    elsif guest?
      space.guest_project
    end
  end

  def org
    if host?
      space.host_dxorg
    elsif guest?
      space.guest_dxorg
    end
  end
end

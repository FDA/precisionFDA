# == Schema Information
#
# Table name: meta_appathons
#
#  id          :integer          not null, primary key
#  name        :string
#  handle      :string
#  description :text
#  meta        :text
#  start_at    :datetime
#  end_at      :datetime
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class MetaAppathon < ActiveRecord::Base
  has_many :appathons

  acts_as_followable

  def uid
    "meta-appathon-#{id}"
  end

  def klass
    "meta-appathon"
  end

  def to_param
    "#{id}-#{handle}"
  end

  def title
    name
  end

  def accessible_by?(context)
    true
  end
  
  def editable_by?(context)
    context.user.can_administer_site?
  end

  def active?
    start_at > DateTime.now && end_at < DateTime.now
  end

  def self.editable_by(context)
    if context.guest?
      none
    else
      raise unless context.user.can_administer_site?
      all
    end
  end

  def self.active
    where("start_at > ?", DateTime.now).where("end_at < ?", DateTime.now)
  end
end

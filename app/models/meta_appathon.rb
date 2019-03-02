# == Schema Information
#
# Table name: meta_appathons
#
#  id          :integer          not null, primary key
#  name        :string
#  handle      :string
#  template    :string
#  description :text
#  meta        :text
#  start_at    :datetime
#  end_at      :datetime
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class MetaAppathon < ActiveRecord::Base
  include Auditor

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
    context.logged_in? && context.user.can_administer_site?
  end

  def is_ongoing?
    start_at < DateTime.now && DateTime.now < end_at
  end

  def member_ids
    followers.map(&:id)
  end

  def apps
    _apps = []
    appathons.each {|appathon| _apps << appathon.apps}
    _apps.flatten
  end

  def self.editable_by(context)
    if context.guest? || !context.user.can_administer_site?
      none
    else
      all
    end
  end

  def self.ongoing
    where("start_at < ?", DateTime.now).where("? < end_at ", DateTime.now)
  end

  def self.active
    find_by_handle(ACTIVE_META_APPATHON)
  end
end

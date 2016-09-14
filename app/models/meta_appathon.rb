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
  has_many :appathons

  acts_as_followable

  ACTIVE_META_APPATHON = 'app-a-thon-in-a-box'

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
    !context.guest? && context.user.can_administer_site?
  end

  def active?
    start_at < DateTime.now && DateTime.now < end_at
  end

  def member_ids
    followers.map(&:id)
  end

  def apps
    # FIXME: Could the sorting be made more efficient?
    _apps = AppSeries.accessible_by_public.where(user_id: member_ids).where("created_at > ?", start_at).where("created_at < ?", end_at)
    _apps = _apps.map { |s| s.latest_version_app }.reject(&:nil?)
    return _apps.sort_by {|a| [-a.app_series.get_upvotes.size, a.app_series.name] }
  end

  def self.editable_by(context)
    if context.guest? || !context.user.can_administer_site?
      none
    else
      all
    end
  end

  def self.active
    where("start_at < ?", DateTime.now).where("? < end_at ", DateTime.now)
  end
end

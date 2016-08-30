# == Schema Information
#
# Table name: appathons
#
#  id               :integer          not null, primary key
#  name             :string
#  admin_id         :integer
#  meta_appathon_id :integer
#  description      :text
#  flag             :string
#  start_at         :datetime         default(Thu, 25 Aug 2016 07:40:05 UTC +00:00)
#  end_at           :datetime
#  meta             :text
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#

class Appathon < ActiveRecord::Base
  belongs_to :meta_appathon
  belongs_to :admin, {class_name: 'User'}

  acts_as_commentable
  acts_as_followable

  def uid
    "appathon-#{id}"
  end

  def klass
    "appathon"
  end

  def to_param
    "#{id}-#{name.parameterize}"
  end

  def title
    name
  end

  def accessible_by?(context)
    true
  end

  def editable_by?(context)
    admin_id == context.user_id
  end

  def active?
    start_at > DateTime.now && end_at < DateTime.now
  end

  def member_ids
    followers.map(&:id)
  end

  def flag_path
    # FIXME: This is just temporary
    icons = %w(baseball bicycle billiards bowling cards charter chess-knight chess-stopwatch diving-mask dumbbell ghosts-pacman glove-fan golf helmet hockey mushroom-from-Mario pedestal ping-pong-racket racing-flag rugby sailing-ship shaker skates skipping-rope soccer-ball soccer-cup stopwatch tennis torch weight)

    icon_id = id % icons.length - 1
    return "icons/SportsGamesIcons_PixelBuddha/Multi-Color Style/PNG/256x256/#{icons[icon_id]}.png"
  end

  def apps
    # FIXME: Could the sorting be made more efficient?
    _apps = AppSeries.accessible_by_public.where(user_id: member_ids).where("created_at > ?", start_at).where("created_at < ?", end_at)
    _apps = _apps.map { |s| s.latest_version_app }.reject(&:nil?)
    return _apps.sort_by {|a| [-a.app_series.get_upvotes.size, a.app_series.name] }
  end

  def self.editable_by(context)
    if context.guest?
      none
    else
      raise unless context.user_id.present?
      where(admin_id: context.user_id)
    end
  end

  def self.active
    where("start_at > ?", DateTime.now).where("end_at < ?", DateTime.now)
  end

  def rename(new_name, context)
    update_attributes(name: new_name)
  end
end

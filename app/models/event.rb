# == Schema Information
#
# Table name: events
#
#  id       :integer          not null, primary key
#  item_id      :integer
#  item_type    :string
#  event_type   :string
#  timestamp    :datetime
#  scope        :string
#  meta         :text
#  user_id      :integer
#

class Event < ActiveRecord::Base
  belongs_to :user
  belongs_to :item, polymorphic: true

  store :meta, accessors: [:_body, :_state], coder: JSON

  def uid
    "event-#{id}"
  end

  def klass
    "event"
  end

  def send_notification(scope, opts = {})
    if event_type == "publish" && Space.is_scope_a_space?(scope)
      space = Space.from_scope(scope)
      if space.is_review?
        NotificationsMailer.space_event_email(space, self, opts).deliver_now!
      end
    end
    return
  end

  def self.events_by_scope(scope)
    return where(scope: scope)
  end

  def self.build_from(obj, event_type)
    e = new \
      :item_id => obj.id,
      :item_type => obj.class.name,
      :event_type => event_type,
      :timestamp => Time.now,
      :user_id => obj.user_id
    case obj.klass
    when "comment", "task"
      e._body = obj.body
      case obj.commentable.klass
      when "space"
        e.scope = obj.commentable.uid
      else
        e.scope = obj.commentable.scope
      end
    else
      e.scope = obj.attributes['scope']? obj.scope : nil
    end
    return e
  end
end

module SpaceEventService
  class MembershipNotifications

    class << self

      def send(event)
        receivers(event).each do |receiver|
          ReviewSpaceMailer.member_email(event, receiver, action(event)).deliver_now!
        end
      end

      private

      def action(event)
        {
          "membership_added" => "added a new member",
          "membership_disabled" => "disabled a member",
          "membership_changed" => "changed role of member",
        }[event.activity_type]
      end

      def receivers(event)
        User.joins(:space_memberships).merge(event.space.space_memberships.active).push(event.entity.user).uniq.select do |user|
          next if user.id == event.user_id
          NotificationPreference.find_by_user(user).membership_changed
        end
      end

    end

  end
end

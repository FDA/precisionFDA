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
          notification_preference_by_role(event, user)
        end
      end

      def notification_preference_by_role(event, user)
        notification_preference = NotificationPreference.find_by_user(user)
        role = event.space.space_memberships.find_by_user_id(user.id).role
        role = "all" unless lead_or_admin?(role)

        admin_preference =
          if rsa?(role, user)
            if membership_changed?(event)
              "admin_membership_changed"
            else
              "admin_member_added_or_removed_from_space"
            end
          else
            nil
          end

        preference =
          if membership_changed?(event)
            "#{role}_membership_changed"
          elsif lead_or_admin?(role)
            "#{role}_member_added_or_removed_from_space"
          else
            nil
          end

        admin_preference = rsa?(role, user) ? "admin_membership_changed" : nil
        if admin_preference && preference
          notification_preference.send(preference) || notification_preference.send(admin_preference)
        elsif preference
          notification_preference.send(preference)
        else
          false
        end
      end

      def rsa?(role, user)
        role != "admin" && user.review_space_admin?
      end

      def membership_changed?(event)
        event.activity_type == "membership_changed"
      end

      def lead_or_admin?(role)
        ["admin", "lead"].include?(role)
      end

    end

  end
end

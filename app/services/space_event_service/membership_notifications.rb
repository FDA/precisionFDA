module SpaceEventService
  class MembershipNotifications

    class << self

      def send(event)
        email_type_id = NotificationPreference.email_types[:notification_space_membership]
        api = DIContainer.resolve("https_apps_client")
        api.email_send(email_type_id, {
          initUserId: event.user_id,
          spaceId: event.space_id,
          updatedMembershipId: event.entity_id,
          activityType: event.activity_type,
          newMembershipRole: event.entity.role,
        })
      end

      private

      def action(event)
        {
          "membership_added" => "added a new member",
          "membership_disabled" => "disabled a member",
          "membership_changed" => "changed role of member",
          "membership_enabled" => "enabled member",
        }[event.activity_type]
      end

      def receivers(event)
        User.joins(:space_memberships).merge(event.space.space_memberships.active).to_a.push(event.entity.user).uniq.select do |user|
          next if user.id == event.user_id || user.challenge_bot?

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

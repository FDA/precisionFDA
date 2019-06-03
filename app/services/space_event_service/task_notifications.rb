module SpaceEventService
  class TaskNotifications

    class << self

      def send(event)
        receivers(event).each do |receiver|
          NotificationsMailer.task_updated_email(event.entity, receiver, action(event)).deliver_now!
        end
      end

      private

      def action(event)
        event.activity_type.to_s.gsub('task_', '')
      end

      def receivers(event)
        [event.entity.user, event.entity.assignee].uniq.select do |user|
          notification_preference_by_role(event, user)
        end
      end

      def notification_preference_by_role(event, user)
        notification_preference = NotificationPreference.find_by_user(user)
        role = event.space.space_memberships.find_by_user_id(user.id).role
        role = "all" unless ["admin", "lead"].include?(role)

        admin_preference =
          if rsa?(role, user)
            if ["created", "reassigned"].include?(action(event))
              "admin_new_task_assigned"
            else
              "admin_task_status_changed"
            end
          else
            nil
          end

        preference =
          if ["created", "reassigned"].include?(action(event))
            "#{role}_new_task_assigned"
          else
            "#{role}_task_status_changed"
          end

        if admin_preference
          notification_preference.send(preference) || notification_preference.send(admin_preference)
        else
          notification_preference.send(preference)
        end
      end

      def rsa?(role, user)
        role != "admin" && user.review_space_admin?
      end

    end

  end
end

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
          NotificationPreference.find_by_user(user).task_assignment
        end
      end

    end

  end
end

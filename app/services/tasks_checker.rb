module TasksChecker
  def self.check_tasks_for_failed_response_deadline
    Task.open.where("response_deadline < ?", Time.now).each do |task|
      NotificationsMailer.user_failed_to_acknowledge_task_email(task).deliver_now!
      task.failed_response_deadline!
    end
  end

  def self.check_tasks_for_failed_completion_deadline
    Task.accepted.where("completion_deadline < ?", Time.now).each do |task|
      NotificationsMailer.user_failed_to_complete_task_email(task).deliver_now!
      task.failed_completion_deadline!
    end
  end
end

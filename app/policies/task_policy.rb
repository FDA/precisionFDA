class TaskPolicy

  # participants and admin can see task
  def self.can_see?(task, member)
    task.assignee_id == member.user_id || task.user_id == member.user_id || member.admin?
  end

  # target user can accept task
  def self.can_accept?(task, member)
    statuses = ['open', 'failed_response_deadline']
    statuses.include?(task.status) && task.assignee_id == member.user_id
  end

  # target user or space admin can complete task
  def self.can_complete?(task, member)
    statuses = ['accepted', 'failed_completion_deadline']
    statuses.include?(task.status) && (task.assignee_id == member.user_id || member.admin?)
  end

  # target user or space admin can decline task
  def self.can_decline?(task, member)
    statuses = ['open', 'failed_response_deadline']
    statuses.include?(task.status) && (task.assignee_id == member.user_id || member.admin?)
  end

  # participants can comment task
  def self.can_comment?(task, member)
    task.user_id == member.user_id || task.assignee_id == member.user_id
  end

  # target user can make active completed task
  def self.can_make_active?(task, member)
    statuses = ['completed']
    statuses.include?(task.status) && task.assignee_id == member.user_id
  end

  # source user can reopen declined or completed task
  def self.can_reopen?(task, member)
    statuses = ['completed']
    statuses.include?(task.status) && task.user_id == member.user_id
  end

  # participants or space admin can clone task
  def self.can_clone?(task, member)
    task.user_id == member.user_id || task.assignee_id == member.user_id || member.admin?
  end

  # participants can edit task
  def self.can_edit?(task, member)
    task.user_id == member.user_id || task.assignee_id == member.user_id
  end

  # participants or space admin can reassign task
  def self.can_reassign?(task, member)
    task.user_id == member.user_id || task.assignee_id == member.user_id || member.admin?
  end

  # source user or space admin can delete task
  def self.can_delete?(task, member)
    task.user_id == member.user_id || member.admin?
  end

end

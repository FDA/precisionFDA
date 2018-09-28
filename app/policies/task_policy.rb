class TaskPolicy

  # target user can accept task
  def self.can_accept?(task, member)
    statuses = ['open', 'failed_response_deadline']
    statuses.include?(task.status) && task.assignee_id == member.user_id
  end

  # target user or space admin can complete task
  def self.can_complete?(task, member)
    statuses = ['accepted', 'failed_completion_deadline']
    statuses.include?(task.status) && (task.assignee_id == member.user_id || (task.space.space_memberships.ids.include?(member.id) && member.role == "admin"))
  end

  # target user or space admin can decline task
  def self.can_decline?(task, member)
    statuses = ['open', 'failed_response_deadline']
    statuses.include?(task.status) && (task.assignee_id == member.user_id || (task.space.space_memberships.ids.include?(member.id) && member.role == "admin"))
  end

  # source or target user or space admin can comment task
  def self.can_comment?(task, member)
    statuses = ['open', 'accepted', 'declined', 'completed', 'failed_response_deadline', 'failed_completion_deadline']
    statuses.include?(task.status) && (task.user_id == member.user_id || task.assignee_id == member.user_id || (task.space.space_memberships.ids.include?(member.id) && member.role == "admin"))
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

  # source or target user or space admin can clone task
  def self.can_clone?(task, member)
    statuses = ['open', 'accepted', 'declined', 'completed', 'failed_response_deadline', 'failed_completion_deadline']
    statuses.include?(task.status) && (task.user_id == member.user_id || task.assignee_id == member.user_id || (task.space.space_memberships.ids.include?(member.id) && member.role == "admin"))
  end

  # source or target user or space admin can edit task
  def self.can_edit?(task, member)
    statuses = ['open', 'accepted', 'declined', 'completed', 'failed_response_deadline', 'failed_completion_deadline']
    statuses.include?(task.status) && (task.user_id == member.user_id || task.assignee_id == member.user_id || (task.space.space_memberships.ids.include?(member.id) && member.role == "admin"))
  end

  # source or target user or space admin can reassign task
  def self.can_reassign?(task, member)
    statuses = ['open', 'accepted', 'declined', 'completed', 'failed_response_deadline', 'failed_completion_deadline']
    statuses.include?(task.status) && (task.user_id == member.user_id || task.assignee_id == member.user_id || (task.space.space_memberships.ids.include?(member.id) && member.role == "admin"))
  end

  # source user or space admin can delete task
  def self.can_delete?(task, member)
    statuses = ['completed']
    statuses.include?(task.status) && (task.user_id == member.user_id || (task.space.space_memberships.ids.include?(member.id) && member.role == "admin"))
  end

end

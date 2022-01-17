# rubocop:todo Metrics/MethodLength
module TasksHelper
  def assignee(task)
    user = task.assignee
    "#{user.first_name} #{user.last_name}"
  end

  def assigner(task)
    user = task.user
    "#{user.first_name} #{user.last_name}"
  end

  def allowed_task_actions(task, membership, filter)
    actions = []
    actions.push('accept') if TaskPolicy.can_accept?(task, membership)
    actions.push('complete') if TaskPolicy.can_complete?(task, membership)
    actions.push('decline') if TaskPolicy.can_decline?(task, membership)
    actions.push('comment') if TaskPolicy.can_comment?(task, membership)
    actions.push('make_active') if TaskPolicy.can_make_active?(task, membership)
    actions.push('reopen') if TaskPolicy.can_reopen?(task, membership)
    actions.push('clone') if TaskPolicy.can_clone?(task, membership)
    actions.push('edit') if TaskPolicy.can_edit?(task, membership)
    actions.push('reassign') if TaskPolicy.can_reassign?(task, membership)
    actions.push('delete') if TaskPolicy.can_delete?(task, membership)

    if actions.include?("make_active") && actions.include?("reopen") && (filter == "my")
      actions.delete("reopen")
    elsif actions.include?("make_active") && actions.include?("reopen")
      actions.delete("make_active")
    end

    actions
  end

  def date_value_by_status(task)
    case task.status
    when "open", "failed_response_deadline"
      {
        respond: task.response_deadline,
        complete: task.completion_deadline,
      }
    when "accepted", "failed_completion_deadline"
      {
        respond: task.response_time,
        complete: task.completion_deadline,
      }
    when "completed"
      {
        respond: task.response_time,
        complete: task.complete_time,
      }
    when "declined"
      {
        respond: task.response_deadline,
        complete: task.response_time,
      }
    else
      { respond: "", complete: "" }
    end
  end

  def response_date_wrapper(task, type)
    date = date_value_by_status(task)[type].try(:strftime, "%m/%d/%Y")
    status = type == :respond ? "failed_response_deadline" : "failed_completion_deadline"
    failed_css = task.status == status ? "failed" : ""
    content_tag(:span, date, class: failed_css)
  end
end
# rubocop:enable Metrics/MethodLength

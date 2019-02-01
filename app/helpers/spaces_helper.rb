module SpacesHelper

  def member_side(space, member)
    if space.groups? || space.verification?
      member.host? ? "host" : "guest"
    elsif space.review?
      member.host? ? "reviewer" : "sponsor"
    end
  end

  def space_sides(space)
    if space.groups?
      SpaceMembership.sides.to_h
    elsif space.review?
      {
        reviewer: SpaceMembership.sides[SpaceMembership::SIDE_HOST],
        sponsor: SpaceMembership.sides[SpaceMembership::SIDE_GUEST],
      }
    end
  end

  def space_initial_roles
    SpaceMembership.roles.slice(:admin, :member).keys
  end

  def space_type(space)
    return 'Verification' if space.verification?
    return 'Group' if space.groups?

    space.confidential? ? 'Confidential' : 'Cooperative'
  end

  def is_active(current_action, item_action, params = nil, status = nil)
    if status and params
      return ((current_action == item_action) and (params[:status] == status))
    end
    return current_action == item_action
  end

  def sidenav_link(href, is_active, icon, count, label, child = false)
    count ||= 0
    root_class_list = 'list-group-item list-item-spaces word-break-all'
    child_class = child ? 'list-child-item-spaces' : ''
    active_class = is_active ? 'active' : ''
    raw """
      <a href='#{href}' class='#{root_class_list} #{child_class} #{active_class}'>
        <span class='list-group-item-label'>
          <i class='fa #{icon}' aria-hidden='true'></i>#{label}
        </span>
        <span class='list-group-item-cnt'>(#{count})</span>
      </a>
    """
  end

  def child_sidenav_link(href, is_active, icon, count, label = nil)
    return sidenav_link(href, is_active, icon, count, label, true)
  end

  def modal_form_row(label, name, required = false, type = 'text', placeholder = '', css_class = '', ko_bind = '')
    required_attr = required ? "required='required'" : ""
    required_class = required ? "required" : ""

    case type
      when 'textarea'
        input_field = """
          <textarea
            class='form-control #{css_class}'
            name='#{name}'
            #{required_attr}
            placeholder='#{placeholder}'
            data-bind='#{ko_bind}'
          ></textarea>
        """
      when 'readonly'
        input_field = """<span class='form-control readonly #{css_class}' disabled data-bind='#{ko_bind}'></span>"""
    else
      input_field = """
        <input
          type='#{type}'
          class='form-control #{css_class}'
          name='#{name}'
          #{required_attr}
          placeholder='#{placeholder}'
          data-bind='#{ko_bind}'
        />
      """
    end

    raw """
      <div class='form-group #{required_class}'>
        <div class='row'>
          <div class='control-label col-sm-6'>
            <label for='task[name]'>#{label}</label>
          </div>
          <div class='col-sm-18'>
            #{input_field}
          </div>
        </div>
      </div>
    """
  end

  def generate_nav_data(space, action, counts, params = nil)
    return {
      feed: {
        url: feed_space_path(space),
        active: is_active(action, 'feed'),
        count: counts[:feed]
      },
      tasks: {
        url: tasks_space_path(space, status: 'awaiting_response', filter: 'my'),
        active: false,
        count: counts[:tasks]
      },
      awaiting_tasks: {
        url: tasks_space_path(space, status: 'awaiting_response', filter: 'my'),
        active: is_active(action, 'tasks', params, 'awaiting_response'),
        count: counts[:open_tasks]
      },
      active_tasks: {
        url: tasks_space_path(space, status: 'accepted', filter: 'my'),
        active: is_active(action, 'tasks', params, 'accepted'),
        count: counts[:accepted_tasks]
      },
      completed_tasks: {
        url: tasks_space_path(space, status: 'completed', filter: 'my'),
        active: is_active(action, 'tasks', params, 'completed'),
        count: counts[:completed_tasks]
      },
      declined_tasks: {
        url: tasks_space_path(space, status: 'declined', filter: 'my'),
        active: is_active(action, 'tasks', params, 'declined'),
        count: counts[:declined_tasks]
      },
      notes: {
        url: notes_space_path(space),
        active: is_active(action, 'notes'),
        count: counts[:notes]
      },
      files: {
        url: files_space_path(space),
        active: is_active(action, 'files'),
        count: counts[:files]
      },
      apps: {
        url: apps_space_path(space),
        active: is_active(action, 'apps'),
        count: counts[:apps]
      },
      jobs: {
        url: jobs_space_path(space),
        active: is_active(action, 'jobs'),
        count: counts[:jobs]
      },
      comparisons: {
        url: comparisons_space_path(space),
        active: is_active(action, 'comparisons'),
        count: counts[:comparisons]
      },
      assets: {
        url: assets_space_path(space),
        active: is_active(action, 'assets'),
        count: counts[:assets]
      },
      workflows: {
        url: workflows_space_path(space),
        active: is_active(action, 'workflows'),
        count: counts[:workflows]
      },
      reports: {
        url: reports_space_path(space),
        active: is_active(action, 'reports'),
        count: counts[:reports]
      },
    }
  end

  def render_button(name, color, icon, multiActions = false, modal = false, label = nil)
    multiText = multiActions ? 'multiActions' : 'singleActions'
    modalAttr = modal ? """data-toggle='modal' data-target='##{modal}'""" : ''
    labelText = label || name.camelize
    raw """
      <button
        id='spaces_tasks_#{name}'
        class='btn btn-#{color} hidden'
        data-task-action='#{name}'
        data-bind='{disable: !#{multiText}()}'
        disabled
        #{modalAttr}
      >
        <i class='fa fa-#{icon}'></i>&nbsp;#{labelText}
      </button>
    """
  end

  def date_value_by_status(task)
    case task.status
      when "open"
        return {
          respond: task.response_deadline,
          complete: task.completion_deadline
        }
      when "failed_response_deadline"
        return {
          respond: task.response_deadline,
          complete: task.completion_deadline
        }
      when "accepted"
        return {
          respond: task.response_time,
          complete: task.completion_deadline
        }
      when "failed_completion_deadline"
        return {
          respond: task.response_time,
          complete: task.completion_deadline
        }
      when "completed"
        return {
          respond: task.response_time,
          complete: task.complete_time
        }
      when "declined"
        return {
          respond: task.response_deadline,
          complete: task.response_time
        }
      else
        return {
          respond: '',
          complete: ''
        }
    end
  end

  def response_date_wrapper(task, type)
    date = date_value_by_status(task)[type].try(:strftime, "%m/%d/%Y")
    status = type == :respond ? 'failed_response_deadline' : 'failed_completion_deadline'
    failed_css = task.status == status ? 'failed' : ''
    content_tag(:span, date, class: "#{failed_css}")
  end

  def main_space_path(space)
    if space.review?
      feed_space_path(space)
    else
      files_space_path(space)
    end
  end

  def member_card_button(title, url, icon)
    raw """
      <a href='#{url}' data-method='post' class='btn btn-xs btn-default'>
        <i class='fa fa-#{icon}'></i>&nbsp;#{title}
      </a>
    """
  end

  def member_card(member)
    role = member.inactive? ? "#{member.role} (disabled)" : member.role
    card_style = member.inactive? ? 'panel-default inactive' : 'panel-info'

    disable_button = nil
    if SpaceMembershipPolicy.can_disable?(@space, @membership, member)
      disable_button = member_card_button('Disable', to_inactive_space_membership_path(member), 'minus-circle')
    end

    to_lead_button = nil
    if SpaceMembershipPolicy.can_lead?(@space, @membership, member)
      to_lead_button = member_card_button('To lead', to_lead_space_membership_path(member), 'star')
    end

    to_admin_button = nil
    if SpaceMembershipPolicy.can_admin?(@space, @membership, member)
      to_admin_button = member_card_button('To admin', to_admin_space_membership_path(member), 'star')
    end

    to_member_button = nil
    if SpaceMembershipPolicy.can_member?(@space, @membership, member)
      to_member_button = member_card_button('To member', to_member_space_membership_path(member), 'star')
    end

    to_viewer_button = nil
    if SpaceMembershipPolicy.can_viewer?(@space, @membership, member)
      to_member_button = member_card_button('To viewer', to_viewer_space_membership_path(member), 'star')
    end

    buttons = nil
    if disable_button || to_lead_button || to_admin_button || to_member_button || to_viewer_button
      buttons = """
        <div class='member-card-row member-card-buttons'>
          #{disable_button}
          #{to_lead_button}
          #{to_admin_button}
          #{to_member_button}
          #{to_viewer_button}
        </div>
      """
    end

    raw """
      <div class='member-card panel #{card_style}'>
        <div class='member-card-header panel-heading'>
          <a href='#{user_path(member.user.dxuser)}'>
            <img src='#{member.user.gravatar_url}' class='img-circle' />
            <span class='member-card-title'>#{member.user.full_name}</span>
          </a>
        </div>

        <div class='member-card-body panel-body'>
          <div class='member-card-row'>
            <div class='member-card-label'>Username:</div>
            <div class='member-card-value'>#{member.user.dxuser}</div>
          </div>
          <div class='member-card-row'>
            <div class='member-card-label'>Role:</div>
            <div class='member-card-value'>#{role}</div>
          </div>
          <div class='member-card-row'>
            <div class='member-card-label'>Organization:</div>
            <div class='member-card-value'>#{member.user.org.name}</div>
          </div>
          <div class='member-card-row'>
            <div class='member-card-label'>Joined on:</div>
            <div class='member-card-value'>#{member.created_at.to_s(:human)}</div>
          </div>
          #{buttons}
        </div>
      </div>
    """
  end

end

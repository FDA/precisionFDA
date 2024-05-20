module ApplicationHelper
  include PathHelper
  include OrgService::RequestFilter
  include Rails.application.routes.url_helpers
  # rubocop:disable Rails/HelperInstanceVariable

  def page_title(separator = " – ")
    [content_for(:title), 'precisionFDA'].compact.join(separator).html_safe
  end

  def bootstrap_class_for(flash_type)
    case flash_type
    when "success"
        "alert-success"
      when "error"
        "alert-danger"
      when "alert", "warning"
        "alert-warning"
      when "notice"
        "alert-info"
      else
        flash_type.to_s
    end
  end

  def humanize_seconds(secs)
    secs = secs.to_i
    if secs <= 0
      return "N/A"
    else
      [[60, :seconds], [60, :minutes], [24, :hours], [1000, :days]].map{ |count, name|
        if secs > 0
          secs, n = secs.divmod(count)
          "#{n.to_i} #{name}"
        end
      }.compact.reverse.join(' ')
    end
  end

  def alert_help(text, path, prompt = "Need help?")
    prompt = "<span class='pfda-help-prompt alert-help-remediated'>#{h(prompt)}</span>" if !prompt.blank?
    raw """
    <div class='pfda-help-block'>
      <span class='fa fa-question-circle' aria-hidden='true'></span>#{prompt}<a href='#{path}' class='review-doc-text' target='_blank'>#{h(text)} <small class='external-link-indicator' aria-hidden='true'><span class='fa fa-external-link' ></span></small></a>
    </div>
    """
  end

  def user_title(user)
    if user.nil?
      "Anonymous"
    else
      user.full_name.titleize
    end
  end

  def user_link(user)
    if user.nil?
      "Anonymous"
    else
      raw "#{link_to(user.full_name.titleize, user_url(user.username))} (#{user.org.name})"
    end
  end

  def fa_class(item)
    case item.klass
    when "file"
      "fa-file-o"
    when "db-cluster"
      "fa-database"
    when "note"
      "fa-sticky-note"
    when "answer"
      "fa-commenting"
    when "discussion"
      "fa-comments-o"
    when "app"
      "fa-cube"
    when "workflow"
      "fa-flash"
    when "job"
      "fa-tasks"
    when "asset"
      "fa-file-zip-o"
    when "comparison"
      "fa-area-chart"
    when "license"
      "fa-legal"
    when "space"
      "fa-object-group"
    when "expert"
      "fa-star-o"
    when "folder"
      "fa-folder"
    else
      raise "Unknown class #{item.klass}"
    end
  end

  # Valid options
  # icon_class: "fa-fw fa-2x"  # Appends to span class
  # scope_icon: true           # Displays scope icon instead of fa_class(item) as icon
  # title_class                # CSS class to apply to title
  # nolink: true               # Show a label, not a link
  # noicon: false              # Show/hide the icon
  # rubocop:disable Metrics/MethodLength
  def unilink(item, opts = {}, context_user = nil)
    current_user = opts[:current_user] || context_user

    return if item.nil?

    icon = fa_class(item)
    if opts[:scope_icon]
      if item.public?
        icon = "fa-globe"
      elsif item.in_space?
        icon = "fa-object-group"
      elsif item.private?
        icon = "fa-lock"
      end
    end

    if opts[:noicon]
      icon_span = ""
    else
      icon_span = content_tag(:span, " ", class: "fa #{icon} #{opts[:icon_class]}") + " "
    end

    if item.check_accessibility(current_user)
      html_opts = { class: opts[:title_class], target: opts[:target] }
      html_opts[:data] = opts[:data] if opts[:data]
      if opts[:nolink]
        icon_span + item.title.to_s
      else
        path = item.in_space? ? space_path_to_item(item) : home_path_to_item(item, opts[:no_home])
        link_to(icon_span + item.title.to_s, path, html_opts)
      end
    else
      icon_span + item.title.to_s # do not show item uid if unaccessible
    end
  end
  # rubocop:enable Metrics/MethodLength

  # Concat item path with '/home' to create a link to Home - for specific items
  def home_path_to_item(item, no_home = false)
    if !no_home && (%w(app app-series job workflow workflow-series).include? item.klass)
      "/home".concat(pathify(item))
    else
      pathify(item)
    end
  end

  # Concat item path with /spaces/<space_id>/ to crate a link to Spaces - for specific items
  def space_path_to_item(item)
    space_id = item.scope.match(/(\d+)/)[0]
    space_pathify(item, space_id)
  end

  # Shortcut for unilink(..., icon_class: fa-fw)

  def unilinkfw(item, opts = {})
    current_user = opts[:current_user] || @context.user

    local_opts = opts.deep_dup
    if local_opts[:icon_class].present?
      local_opts[:icon_class] += " fa-fw"
    else
      local_opts[:icon_class] = "fa-fw"
    end
    local_opts.merge!(data: { turbolinks: false })
    local_opts.merge!(current_user: current_user)

    unilink(item, local_opts, current_user)
  end

  def guest_hide
    'style="display: none"'.html_safe if @context.guest?
  end

  def guest_disable
    'disabled="true"'.html_safe if @context.guest?
  end

  def time_ago(time)
    if time.to_date == Date.today
      "#{time_ago_in_words(time)} ago"
    elsif time.to_date == Date.yesterday
      time.strftime("yesterday at %l:%M%P")
    elsif (Date.today - time.to_date).ceil < 7
      time.strftime("%A at %l:%M%P")
    else
      time.strftime("on %b %d")
    end
  end

  def git_revision
    "#{GIT_BRANCH}:#{GIT_REVISION}"
  end

  def leave_org_alert_shown?
    return if !@context.logged_in?
    return if controller_name == "main" && action_name == "index"
    return if current_user.org.admin == current_user && current_user.org.users.size > 1

    filter_requests(current_user, OrgActionRequest::State::APPROVED).first.present?
  end

  # Checks if user opens spaces page.
  # @param space [Space, nil] The space.
  # @return [Boolean] Returns true if user opens spaces page, false otherwise.
  def inside_of_spaces?
    controller_name == "spaces" && action_name == "index"
  end

  # Checks if user opens a space item show page (App, File, Workflow).
  # @param space [Space, nil] The space.
  # @return [Boolean] Returns true if user opens a space item show page, false otherwise.
  def inside_of_space_item?(space = nil)
    %w(apps files workflows).include?(controller_name) &&
      action_name == "show" &&
      space.present?
  end
  # rubocop:enable Rails/HelperInstanceVariable
end

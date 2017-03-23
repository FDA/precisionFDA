module ApplicationHelper
  def page_title(separator = " – ")
    [content_for(:title), 'precisionFDA'].compact.join(separator).html_safe
  end

  def bootstrap_class_for flash_type
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

  def humanizeSeconds secs
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
    prompt = "<span class='pfda-help-prompt'>#{h(prompt)}</span>" if !prompt.blank?
    raw """
    <div class='pfda-help-block'>
      <span class='fa fa-question-circle' aria-hidden='true'></span>#{prompt}<a href='#{path}' target='_blank'>#{h(text)} <small class='external-link-indicator' aria-hidden='true'><span class='fa fa-external-link' ></span></small></a>
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
    when "note"
      "fa-sticky-note"
    when "answer"
      "fa-commenting"
    when "discussion"
      "fa-comments-o"
    when "app"
      "fa-cube"
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
  #
  def unilink(item, opts = {})
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

    if item.accessible_by?(@context)
      opts[:nolink] ? icon_span + item.title.to_s : link_to(icon_span + item.title.to_s, pathify(item), {class: opts[:title_class]})
    else
      icon_span + item.uid
    end
  end

  # Shortcut for unilink(..., icon_class: fa-fw)
  #
  def unilinkfw(item, opts = {})
    local_opts = opts.deep_dup
    if local_opts[:icon_class].present?
      local_opts[:icon_class] += " fa-fw"
    else
      local_opts[:icon_class] = "fa-fw"
    end
    unilink(item, local_opts)
  end

  def guest_hide
    'style="display: none"'.html_safe if @context.guest?
  end

  def guest_disable
    'disabled="true"'.html_safe if @context.guest?
  end

end

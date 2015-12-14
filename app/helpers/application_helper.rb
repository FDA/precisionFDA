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
      when "alert"
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

  def fa_class(item)
    case item.klass
    when "file"
      "fa-file-o"
    when "note"
      "fa-sticky-note"
    when "app"
      "fa-cube"
    when "job"
      "fa-tasks"
    when "asset"
      "fa-file-zip-o"
    when "comparison"
      "fa-area-chart"
    else
      raise "Unknown class #{item.klass}"
    end
  end

  # Valid options
  # icon_class: "fa-fw fa-2x"  # Appends to span class
  # globe: true                # Uses globe-vs-nothing instead of fa_class(item) as icon
  # nolink: true               # Show a label, not a link
  #
  def unilink(item, opts = {})
    icon = opts[:globe] ? (item.public? ? "fa-globe" : "fa-lock") : fa_class(item)
    icon_span = content_tag(:span, " ", class: "fa #{icon} #{opts[:icon_class]}") + " "
    if item.accessible_by?(@context)
      opts[:nolink] ? icon_span + item.title : link_to(icon_span + item.title, pathify(item))
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

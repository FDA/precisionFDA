module ApplicationHelper
  def pathify(item)
    case item.klass
    when "file"
      file_path(item.dxid)
    when "note"
      if item.note_type == "Answer"
        pathify(item.answer)
      elsif item.note_type == "Discussion"
        pathify(item.discussion)
      else
        note_path(item)
      end
    when "app"
      app_path(item.dxid)
    when "app-series"
      pathify(item.latest_accessible(@context))
    when "job"
      job_path(item.dxid)
    when "asset"
      asset_path(item.dxid)
    when "comparison"
      comparison_path(item)
    when "discussion"
      discussion_path(item)
    when "answer"
      discussion_answer_path(item.discussion, item.user.dxuser)
    when "user"
      user_path(item.dxuser)
    when "license"
      license_path(item)
    when "space"
      space_path(item)
    when "meta_appathon"
      meta_appathon_path(item)
    when "appathon"
      appathon_path(item)
    else
      raise "Unknown class #{item.klass}"
    end
  end

  def pathify_comments(item)
    case item.klass
    when "file"
      file_comments_path(item.dxid)
    when "note"
      if item.note_type == "Answer"
        pathify_comments(item.answer)
      elsif item.note_type == "Discussion"
        pathify_comments(item.discussion)
      else
        note_comments_path(item)
      end
    when "app"
      app_comments_path(item.dxid)
    when "job"
      job_comments_path(item.dxid)
    when "asset"
      asset_comments_path(item.dxid)
    when "comparison"
      comparison_comments_path(item)
    when "discussion"
      discussion_comments_path(item)
    when "answer"
      discussion_answer_comments_path(item.discussion, item.user.dxuser)
    when "space"
      space_comments_path(item)
    when "meta_appathon"
      meta_appathon_comments_path(item)
    when "appathon"
      appathon_comments_path(item)
    else
      raise "Unknown class #{item.klass}"
    end
  end

  def pathify_comments_redirect(item)
    case item.klass
    when "discussion"
      discussion_comments_path(item)
    when "note"
      if item.note_type == "Answer"
        pathify_comments_redirect(item.answer)
      elsif item.note_type == "Discussion"
        pathify_comments_redirect(item.discussion)
      else
        pathify(item)
      end
    when "space"
      discuss_space_path(item)
    when "meta_appathon", "appathon", "file", "app", "job", "asset", "comparison", "answer", "space"
      pathify(item)
    else
      raise "Unknown class #{item.klass}"
    end
  end

  def item_from_uid(uid, specified_klass = nil)
    if uid =~ /^(job|app|file)-(.{24})$/
      klass = {
        "job" => Job,
        "app" => App,
        "file" => UserFile
      }[$1]
      raise "Class '#{klass}' did not match specified class '#{specified_klass}'" if specified_klass && klass != specified_klass
      record = klass.find_by!(dxid: uid)
      if klass == UserFile && record.parent_type == "Asset"
        record = record.becomes(Asset)
      end
      return record
    elsif uid =~ /^(app-series|appathon|comparison|note|discussion|answer|user|license|space)-(\d+)$/
      klass = {
        "app-series" => AppSeries,
        "appathon" => Appathon,
        "comparison" => Comparison,
        "note" => Note,
        "discussion" => Discussion,
        "answer" => Answer,
        "user" => User,
        "license" => License,
        "space" => Space
      }[$1]
      id = $2.to_i
      raise "Class '#{klass}' did not match specified class '#{specified_klass}'" if specified_klass && klass != specified_klass
      return klass.find_by!(id: id)
    else
      raise "Invalid id '#{uid}' in item_from_uid"
    end
  end

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
    when "app", "app-series"
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
    when "task"
      "fa-map-pin"
    when "comment"
      "fa-comment"
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

  def indefinitize(params_word)
    %w(a e i o u).include?(params_word[0].downcase) ? "an #{params_word}" : "a #{params_word}"
  end
end

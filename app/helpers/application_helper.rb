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
    if secs == 0
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
end

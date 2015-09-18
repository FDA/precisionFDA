module ApplicationHelper
  def page_title(separator = " – ")
    [content_for(:title), 'precisionFDA'].compact.join(separator)
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
end

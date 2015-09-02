module ApplicationHelper
  def page_title(separator = " – ")
    [content_for(:title), 'precisionFDA'].compact.join(separator)
  end
end

module FilesHelper
  include PathHelper
  include ActionView::Helpers::UrlHelper
  include ApplicationHelper


  def file_description(file)
    file.description.present? ? file.description : "This file has no description."
  end
end

# UserFile serializer.
class UserFileSerializer < NodeSerializer
  include ActionView::Helpers::NumberHelper

  attributes(
    :uid,
    :file_size,
    :created_at,
    :links,
  )

  def file_size
    number_to_human_size(object.file_size)
  end

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end

  # Builds links to files.
  # @return [Hash] Links.
  def links
    {
      show: file_path(object),
      rename: api_file_path(object),
    }
  end
end

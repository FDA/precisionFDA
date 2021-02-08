# Note serializer.
class NoteSerializer < ApplicationSerializer
  attributes(
    :id,
    :title,
    :content,
    :added_by,
    :added_by_fullname,
    :created_at,
    :created_at_date_time,
    :location,
    :note_type,
    :links,
  )

  attribute :all_tags_list, key: :tags

  delegate :all_tags_list, to: :object

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end

  # Builds links.
  # @return [Hash] Links.
  def links
    return {} unless object.user.logged_in?

    {}.tap do |links|
      links[:show] = note_path(object)
      links[:user] = user_path(added_by)
      links[:space] = space_path if object.in_space?
    end
  end
end

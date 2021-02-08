# Node serializer.
class NodeSerializer < ApplicationSerializer
  attributes(
    :id,
    :name,
    :type,
    :state,
    :location,
    :added_by,
    :created_at,
    :all_tags_list,
    :featured,
  )

  attribute :sti_type, key: :type

  # Returns a user who has created this node.
  # @return [String] User full name.
  def added_by
    object.user.full_name
  end

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end
end

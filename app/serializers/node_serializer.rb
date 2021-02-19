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
    :space_id,
  )

  attribute :sti_type, key: :type

  # Returns object's space id - when object is in space
  def space_id
    object.space_object&.scope if object.in_space?
  end

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

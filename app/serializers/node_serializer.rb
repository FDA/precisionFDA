# Node serializer.
class NodeSerializer < ApplicationSerializer
  include ActionView::Helpers::NumberHelper
  include FilesHelper

  delegate :all_tags_list, to: :object

  attributes(
    :id,
    :name,
    :type,
    :state,
    :location,
    :added_by,
    :created_at,
    :featured,
    :scope,
    :space_id,
  )

  attribute :sti_type, key: :type
  attribute :origin, if: -> { object.is_a?(UserFile) || object.is_a?(Folder) && object.https? }
  attribute :all_tags_list, key: :tags
  attribute :scope_id, key: :scope

  def scope_id
    object.scope
  end

  # Builds links to files.
  # @return [Hash] Links.
  def links
    return {} unless current_user

    {}.tap do |links|
      links[:origin_object] = origin_object
    end
  end

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

  # Returns a node's origin: one of Executable, Uploaded or Job origin data.
  # @return [String] origin name.
  def origin
    return unless current_user

    node_origin(object, current_user)
  end

  def origin_object
    {
      origin_type: object.parent&.class&.name,
      origin_uid: object.parent&.uid,
    }
  end
end

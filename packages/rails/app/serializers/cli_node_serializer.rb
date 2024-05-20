# Node serializer.
class CliNodeSerializer < ApplicationSerializer
  include ActionView::Helpers::NumberHelper
  include FilesHelper

  delegate :all_tags_list, to: :object

  attributes(
    :id,
    :uid,
    :name,
    :type,
    :state,
    :added_by,
    :created_at,
    :file_size,
    :scope,
    :space_id,
    :locked,
  )

  attribute :sti_type, key: :type
  attribute :scope_id, key: :scope


  def scope_id
    object.scope
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
    formatted_date_time(object.created_at)
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

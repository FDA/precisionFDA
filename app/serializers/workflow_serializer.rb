# Workflow serializer.
class WorkflowSerializer < ApplicationSerializer
  attributes(
    :id,
    :name,
    :added_by,
    :created_at,
    :scope,
    :links,
  )

  # Returns a user who has created this workflow.
  # @return [String] User full name.
  def added_by
    object.user.full_name
  end

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end

  # Builds links.
  # @return [Hash] Links.
  def links
    return unless current_user

    {}.tap do |links|
      links[:show] = workflow_path(object)
      links[:user] = user_path(object.user.dxuser)
    end
  end

  delegate :scope, to: :object
end

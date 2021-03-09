# Space concern.
module SpaceConcern
  # Finds a space by id.
  # @return [Space] A space object.
  def find_space
    @space = Space.find(params[:space_id])

    head(:forbidden) unless @space.accessible_by?(@context)
  end

  # Finds a space by id, accessible by current user.
  # @param space_id [Integer]
  # @return [Space] A space Object if it is accessible by user, visible and not locked OR
  #   return nil Object if not.
  def find_user_space
    @space = Space.undeleted.find(params[:space_id])
    raise ApiError, "The space is locked." if @space.visible_by?(current_user) && @space.locked?

    return nil unless @space.accessible_by_user?(current_user)

    @space
  end

  # Checks if user is able to modify content of a space.
  def can_edit?
    head(:forbidden) unless @space.editable_by?(current_user)
  end
end

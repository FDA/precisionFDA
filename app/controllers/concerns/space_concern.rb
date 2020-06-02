# Space concern.
module SpaceConcern
  # Finds a space by id.
  def find_space
    @space = Space.find(params[:space_id])

    head(:forbidden) unless @space.accessible_by?(@context)
  end

  # Checks if user is able to modify content of a space.
  def can_edit?
    head(:forbidden) unless @space.editable_by?(current_user)
  end
end

# Contains object location method.
module ObjectLocation
  extend ActiveSupport::Concern

  # Returns object's location - its scope
  # @return [String] Scope - a value on of: 'public', 'private' or 'space-xxx'.
  #   Scope or Space name are titleized.
  def location
    return scope.titleize unless in_space?

    space = space_object

    if space.confidential?
      "#{space.name} - Private"
    else
      "#{space.name} - Shared"
    end
  end
end

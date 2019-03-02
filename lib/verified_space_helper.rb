module VerifiedSpaceHelper
  def in_verified_space?(object)
    if object.in_space?
      object.space_object.try(:verified?) || false
    else
      false
    end
  end
end

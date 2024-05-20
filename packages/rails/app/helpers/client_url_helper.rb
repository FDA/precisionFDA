# Space url helpers for a backward compatibility.
module ClientUrlHelper
  def _space_url(space)
    check_space!(space)

    "#{HOST}/spaces/#{space.id}"
  end

  def _space_path(space)
    check_space!(space)

    "/spaces/#{space.id}"
  end

  private

  def check_space!(space)
    raise ArgumentError, "argument is not a Space" unless space.is_a?(Space)
  end
end

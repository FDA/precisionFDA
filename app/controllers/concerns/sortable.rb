# Provides SQL-related ordering methods.
module Sortable
  DIRECTION_ASC = "ASC".freeze
  DIRECTION_DESC = "DESC".freeze

  def order_direction(candidate)
    [DIRECTION_ASC, DIRECTION_DESC].include?(candidate&.upcase) ? candidate : DIRECTION_DESC
  end

  def order_by(candidate, allowed_orderings)
    allowed_orderings.include?(candidate) ? candidate : allowed_orderings.first
  end

  def order_query(candidate_by, candidate_dir, allowed_orderings)
    { order_by(candidate_by, allowed_orderings) => order_direction(candidate_dir) }
  end
end

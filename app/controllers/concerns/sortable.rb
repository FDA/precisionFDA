# Provides SQL-related ordering methods.
module Sortable
  DIRECTION_ASC = "ASC".freeze
  DIRECTION_DESC = "DESC".freeze

  ORDER_FIELDS = {
    "created_at" => %w(created_at),
    "name" => %w(name),
    "title" => %w(title),
    "username" => %w(users.first_name users.last_name),
    "revision" => %w(revision),
  }.freeze
  ORDER_FIELD_VALUES = ORDER_FIELDS.values.flatten.freeze

  SORT_FIELDS = {
    "created_at" => ->(left, right) { left.created_at <=> right.created_at },
    "name" => ->(left, right) { left.name <=> right.name },
    "title" => ->(left, right) { left.title <=> right.title },
    "username" => ->(left, right) { left.user.full_name <=> right.user.full_name },
    "revision" => ->(left, right) { left.revision <=> right.revision },
    "location" => ->(left, right) { left.location.downcase <=> right.location.downcase },
  }.freeze

  def order_direction(candidate)
    candidate&.upcase == DIRECTION_DESC ? DIRECTION_DESC : DIRECTION_ASC
  end

  def order_by(candidate, allowed_orderings)
    allowed_orderings.include?(candidate) ? candidate : allowed_orderings.first
  end

  def order_query(candidates_by, candidate_dir, allowed_orderings)
    sanitized_candidate_dir = candidate_dir&.upcase == DIRECTION_DESC ? DIRECTION_DESC : DIRECTION_ASC

    ordering = {}

    Array(candidates_by).each do |candidate_by|
      ordering[candidate_by] = sanitized_candidate_dir if allowed_orderings.include?(candidate_by)
    end

    ordering
  end

  # Manually sort array in direct/reverse order by sort_fields.
  # @param array input arrays of objects for sort.
  # @return sorted array.
  def sort_array_by_fields(array, default_order = "launched_on")
    sort_by = self.class::SORT_FIELDS[params[:order_by] || default_order]
    array = array.sort(&sort_by)

    params[:order_dir] != Sortable::DIRECTION_ASC ? array.reverse : array
  end

  # Prepare Order/OrderDirection pair from params (only allowed values).
  # @return { order => order_dir }, { :launched_on => 'DESC' }
  #   if no param values provided.
  def order_from_params(default_order = "launched_on")
    order_by = params[:order_by].presence_in(ORDER_FIELDS.keys) || default_order

    order_dir = order_direction(params[:order_dir])

    order_query([order_by], order_dir, ORDER_FIELD_VALUES)
  end

  # Convert input value to array.
  # @param order
  # @return [Array] with order inside.
  def pick_values(order)
    case order
    when Array then order
    when String then [order]
    else []
    end
  end
end

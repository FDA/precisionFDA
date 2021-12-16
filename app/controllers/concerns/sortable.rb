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
    [DIRECTION_ASC, DIRECTION_DESC].include?(candidate&.upcase) ? candidate : DIRECTION_DESC
  end

  def order_by(candidate, allowed_orderings)
    allowed_orderings.include?(candidate) ? candidate : allowed_orderings.first
  end

  def order_query(candidates_by, candidate_dir, allowed_orderings)
    Hash[pick_values(candidates_by).collect do |candidate_by|
      [order_by(candidate_by, allowed_orderings), order_direction(candidate_dir)]
    end]
  end

  # Manually sort array in direct/reverse order by sort_fields.
  # @param array input arrays of objects for sort.
  # @param sort_fields list of lambdas.
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
    order_field_values = self.class::ORDER_FIELDS.values.flatten
    order_query(self.class::ORDER_FIELDS[params[:order_by] || default_order],
                params[:order_dir], order_field_values)
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

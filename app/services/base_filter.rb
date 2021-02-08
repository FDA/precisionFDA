# BaseFilter methods.
module BaseFilter
  FILTER_FIELDS = {}.freeze
  MATCH_FIELDS = {}.freeze

  # Match App.
  # @param record [App] app.
  # @param filters [Hash] Filter object.
  # @return [ActiveRecord::Relation<AppsSeries>] Filtered AppsSeries.
  def match(record, filters)
    match = true
    (filters || {}).each do |k, v|
      condition = self::MATCH_FIELDS[k]
      match &&= condition.call(record, v&.downcase) if record.present? && condition.present?
    end

    match
  end

  # Filters AppSeries/Apps.
  # @param records [ActiveRecord::Relation<AppSeries>] or [ActiveRecord::Relation<App>] records.
  # @param filters [Hash] Filter object.
  # @return [ActiveRecord::Relation<AppSeries>] or [ActiveRecord::Relation<App>] Filtered nodes.
  def call(records, filters)
    records = records.where(build_where(filters.except(:tags))) if filters.present?
    records
  end

  # Builds AREL where clause.
  # @param filters [Hash] Search query.
  # @return [Arel::Node] Built where AREL node.
  def build_where(filters)
    conditions = []
    filters.each do |k, v|
      condition = self::FILTER_FIELDS[k]
      conditions << condition.call(v) if condition.present?
    end

    conditions.reduce(nil) do |where, condition|
      where ? where.and(condition) : condition
    end
  end

  # Create condition based on  input value to array.
  # @param field AREL.field
  # @param value [String] or [Array]
  # @return where condition.
  def condition(field, value)
    case value
    when Array then field.in(value)
    when String then field.matches(sanitize(value))
    when Integer then field.eq(value)
    end
  end

  # Sanitize the input query.
  # @param query [String] Search query.
  # @return sanitized [String] wrapped with '%'.
  def sanitize(query)
    "%" + ActiveRecord::Base.sanitize_sql_like(query) + "%"
  end
end

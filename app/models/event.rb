class Event < ActiveRecord::Base
  include Auditor

  scope :date_range, ->(begin_at, end_at) { where(created_at: begin_at..end_at) }

  def self.select_sum(attribute)
    original_name = attribute_alias(attribute)
    query = sanitize_query_with_args("SUM(?) as ?", [original_name, original_name])
    select(query)
  end

  def self.select_count
    select("COUNT(id) as count")
  end

  def self.select_count_uniq_by(attribute)
    original_name = attribute_alias(attribute) || attribute
    query = sanitize_query_with_args("COUNT(DISTINCT ?) as count", [original_name])
    select(query)
  end

  def self.group_by_hour
    select("DATE_FORMAT(created_at, '%Y-%m-%d %H:00') AS date").group("date")
  end

  def self.group_by_day
    select("DATE(created_at) as date").group("date")
  end

  def self.group_by_month
    select("DATE(DATE_FORMAT(created_at, '%Y-%m-01')) AS date").group("date")
  end

  def self.sanitize_query_with_args(sql, args)
    sanitize_sql_array([sql, args].flatten)
  end
end

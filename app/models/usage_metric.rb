class UsageMetric < ActiveRecord::Base
  include Auditor

  USER_STATES = %w(enabled locked).freeze

  belongs_to :user

  def byte_hours(range)
    case range
    when 'day'
      daily_byte_hours
    when 'week'
      weekly_byte_hours
    when 'month'
      monthly_byte_hours
    when 'year'
      yearly_byte_hours
    when 'cumulative'
      yearly_byte_hours
    when 'custom'
      custom_range_byte_hours
    end
  end

  def compute_price(range)
    case range
    when 'day'
      daily_compute_price
    when 'week'
      weekly_compute_price
    when 'month'
      monthly_compute_price
    when 'year'
      yearly_compute_price
    when 'cumulative'
      cumulative_compute_price
    when 'custom'
      custom_range_compute_price
    end
  end
end

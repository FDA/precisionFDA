class UsageMetric < ActiveRecord::Base
  include Auditor

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
      ""
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
      yearly_compute_price
    when 'custom'
      ""
    end
  end
end

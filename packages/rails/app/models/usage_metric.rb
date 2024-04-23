# == Schema Information
#
# Table name: usage_metrics
#
#  id                         :integer          not null, primary key
#  user_id                    :integer          not null
#  storage_usage              :bigint
#  daily_compute_price        :decimal(30, 20)
#  weekly_compute_price       :decimal(30, 20)
#  monthly_compute_price      :decimal(30, 20)
#  yearly_compute_price       :decimal(30, 20)
#  created_at                 :datetime
#  daily_byte_hours           :bigint
#  weekly_byte_hours          :bigint
#  monthly_byte_hours         :bigint
#  yearly_byte_hours          :bigint
#  custom_range_byte_hours    :bigint
#  custom_range_compute_price :decimal(30, 20)
#  cumulative_compute_price   :decimal(30, 20)
#  cumulative_byte_hours      :bigint
#

class UsageMetric < ApplicationRecord
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

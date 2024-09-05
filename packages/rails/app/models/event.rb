# == Schema Information
#
# Table name: events
#
#  id         :integer          not null, primary key
#  type       :string(255)
#  org_handle :string(255)
#  dxuser     :string(255)
#  param1     :string(255)
#  param2     :string(255)
#  param3     :string(255)
#  created_at :datetime         not null
#  param4     :string(255)
#  data       :text(65535)
#

class Event < ApplicationRecord
  include Auditor

  scope :date_range, ->(begin_at, end_at) { where(created_at: begin_at..end_at) }

  store :data, coder: JSON

  class << self
    def select_sum(attribute)
      original_name = attribute_alias(attribute)
      query = sanitize_sql("CAST(SUM(#{original_name}) AS UNSIGNED) as #{original_name}")
      select(query)
    end

    def select_count
      select("COUNT(id) as count")
    end

    def select_count_uniq_by(attribute)
      original_name = attribute_alias(attribute) || attribute
      query = sanitize_sql("COUNT(DISTINCT #{original_name}) as count")
      select(query)
    end

    def group_by_hour
      select("DATE_FORMAT(created_at, '%Y-%m-%d %H:00') AS date").group("date")
    end

    def group_by_day
      select("DATE(created_at) as date").group("date")
    end

    def group_by_month
      select("DATE(DATE_FORMAT(created_at, '%Y-%m-01')) AS date").group("date")
    end
  end
end

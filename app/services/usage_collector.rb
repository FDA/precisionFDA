require 'usage_collector/cloud_resource'

class UsageCollector

  TABLE_NAME = 'usage_metrics'

  class << self

    def call(on_date = Date.today)
      ActiveRecord::Base.connection.execute(truncate_query)
      ActiveRecord::Base.connection.execute(collect_data_query(on_date))
      collect_consumption
    end

    def collect_for_custom_range
      User.real.find_each do |user|
        metric = user.usage_metric ? user.usage_metric : user.build_usage_metric
        metric.update(
          custom_range_byte_hours: CloudResource.consumption(custom_range_start, custom_range_end, user),
          custom_range_compute_price: custom_range_compute_price(user)
        )
      end
    end

    private

    def truncate_query
      "TRUNCATE #{TABLE_NAME};"
    end

    def collect_data_query(on_date)
      day_start = sql_date(on_date)
      day_after_start = sql_date(on_date + 1.day)
      day_before_start = sql_date(on_date - 1.day)
      week_before_start = sql_date(on_date - 1.week)
      month_before_start = sql_date(on_date - 1.month)
      year_before_start = sql_date(on_date - 1.year)

      <<-SQL
        INSERT INTO #{TABLE_NAME} (
          user_id,
          storage_usage,
          daily_compute_price,
          weekly_compute_price,
          monthly_compute_price,
          yearly_compute_price,
          custom_range_compute_price,
          created_at
        ) SELECT
          t0.id AS user_id,
          (IFNULL(t1.storage, 0) - IFNULL(t2.storage, 0)) AS storage_usage,
          IFNULL(t3.day_price, 0) AS daily_compute_price,
          IFNULL(t4.week_price, 0) AS weekly_compute_price,
          IFNULL(t5.month_price, 0) AS monthly_compute_price,
          IFNULL(t6.year_price, 0) AS yearly_compute_price,
          IFNULL(t7.custom_price, 0) AS custom_range_compute_price,
          NOW() as created_at
        FROM users AS t0
        LEFT JOIN (
          SELECT dxuser, SUM(param1) AS storage FROM events WHERE type = 'Event::FileCreated' AND created_at < #{day_after_start} GROUP BY dxuser
        ) AS t1 ON t0.dxuser = t1.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param1) AS storage FROM events WHERE type = 'Event::FileDeleted' AND created_at < #{day_after_start} GROUP BY dxuser
        ) AS t2 ON t0.dxuser = t2.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param3) AS day_price FROM events WHERE type = 'Event::JobClosed' AND created_at >= #{day_before_start} AND created_at < #{day_start} GROUP BY dxuser
        ) AS t3 ON t0.dxuser = t3.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param3) AS week_price FROM events WHERE type = 'Event::JobClosed' AND created_at >= #{week_before_start} AND created_at < #{day_start} GROUP BY dxuser
        ) AS t4 ON t0.dxuser = t4.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param3) AS month_price FROM events WHERE type = 'Event::JobClosed' AND created_at >= #{month_before_start} AND created_at < #{day_start} GROUP BY dxuser
        ) AS t5 ON t0.dxuser = t5.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param3) AS year_price FROM events WHERE type = 'Event::JobClosed' AND created_at >= #{year_before_start} AND created_at < #{day_start} GROUP BY dxuser
        ) AS t6 ON t0.dxuser = t6.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param3) AS custom_price FROM events WHERE type = 'Event::JobClosed' AND created_at >= #{sql_date(custom_range_start)} AND created_at < #{sql_date(custom_range_end)} GROUP BY dxuser
        ) AS t7 ON t0.dxuser = t7.dxuser
        WHERE t0.dxuser != #{ActiveRecord::Base.sanitize(CHALLENGE_BOT_DX_USER)};
      SQL
    end

    # Update cloud resource consumption for all periods
    def collect_consumption
      User.real.find_each do |user|
        metric = user.usage_metric ? user.usage_metric : user.build_usage_metric
        metric.update(
          custom_range_byte_hours: CloudResource.consumption(custom_range_start, custom_range_end, user),
          daily_byte_hours: CloudResource.daily_consumption(user),
          weekly_byte_hours: CloudResource.weekly_consumption(user),
          monthly_byte_hours: CloudResource.monthly_consumption(user),
          yearly_byte_hours: CloudResource.yearly_consumption(user)
        )
      end
    end

    def custom_range_compute_price(user)
      Event::JobClosed
        .date_range(custom_range_start, custom_range_end)
        .where(dxuser: user.dxuser)
        .sum(:price)
    end

    def sql_date(date)
      ActiveRecord::Base.sanitize(date.strftime("%Y-%m-%d"))
    end

    def custom_range_start
      Date.parse(custom_range['date_from']).beginning_of_day
    end

    def custom_range_end
      Date.parse(custom_range['date_to']).end_of_day
    end

    def custom_range
      Setting.usage_metrics_custom_range
    end

  end

end

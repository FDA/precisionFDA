# Collects usage statistics.
# rubocop:disable Metrics/ClassLength
class UsageCollector
  TABLE_NAME = "usage_metrics".freeze

  class << self
    # Collects usage statistics and stores it in database.
    # @param on_date [Date] Date to compute statistics for.
    def call(on_date = Time.zone.today)
      truncate_table
      collect_compute_prices(on_date)
      collect_consumptions
    end

    # Creates or updates usage metrics for every real user.
    def collect_for_custom_range
      User.real.find_each do |user|
        metric = UsageMetric.find_or_initialize_by(user: user)

        metric.update(
          custom_range_byte_hours: custom_range_consumption(user),
          custom_range_compute_price: custom_range_compute_price(user),
        )
      end
    end

    private

    # Truncates usage table.
    def truncate_table
      execute("TRUNCATE #{TABLE_NAME};")
    end

    # Update cloud resource consumption for all periods for each user.
    def collect_consumptions
      User.real.find_each do |user|
        metric = UsageMetric.find_or_initialize_by(user: user)

        metric.update(
          custom_range_byte_hours: custom_range_consumption(user),
          daily_byte_hours: CloudResource.daily_consumption(user),
          weekly_byte_hours: CloudResource.weekly_consumption(user),
          monthly_byte_hours: CloudResource.monthly_consumption(user),
          yearly_byte_hours: CloudResource.yearly_consumption(user),
          cumulative_byte_hours: CloudResource.cumulative_consumption(user),
        )
      end
    end

    # Creates usage records for every user at given date.
    # @param on_date [Date] Date to collect data for.
    def collect_compute_prices(on_date)
      execute(compute_prices_query(on_date))
    end

    # Builds SQL query to insert records by.
    # @param on_date [Date] Date to collect data for.
    def compute_prices_query(on_date)
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
          cumulative_compute_price,
          created_at
        ) SELECT
          t0.id AS user_id,
          (IFNULL(t1.storage, 0) - IFNULL(t2.storage, 0)) AS storage_usage,
          IFNULL(t3.day_price, 0) AS daily_compute_price,
          IFNULL(t4.week_price, 0) AS weekly_compute_price,
          IFNULL(t5.month_price, 0) AS monthly_compute_price,
          IFNULL(t6.year_price, 0) AS yearly_compute_price,
          IFNULL(t7.custom_price, 0) AS custom_range_compute_price,
          IFNULL(t8.cumulative_price, 0) AS cumulative_compute_price,
          NOW() as created_at
        FROM users AS t0
        LEFT JOIN (
          SELECT dxuser, SUM(param1) AS storage
          FROM events
          WHERE type = 'Event::FileCreated'
          AND created_at < #{day_after_start}
          GROUP BY dxuser
        ) AS t1 ON t0.dxuser = t1.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param1) AS storage
          FROM events
          WHERE type = 'Event::FileDeleted'
          AND created_at < #{day_after_start}
          GROUP BY dxuser
        ) AS t2 ON t0.dxuser = t2.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param3) AS day_price
          FROM events
          WHERE type = 'Event::JobClosed'
          AND created_at >= #{day_before_start}
          AND created_at < #{day_start}
          GROUP BY dxuser
        ) AS t3 ON t0.dxuser = t3.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param3) AS week_price
          FROM events
          WHERE type = 'Event::JobClosed'
          AND created_at >= #{week_before_start}
          AND created_at < #{day_start}
          GROUP BY dxuser
        ) AS t4 ON t0.dxuser = t4.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param3) AS month_price
          FROM events
          WHERE type = 'Event::JobClosed'
          AND created_at >= #{month_before_start}
          AND created_at < #{day_start}
          GROUP BY dxuser
        ) AS t5 ON t0.dxuser = t5.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param3) AS year_price
          FROM events
          WHERE type = 'Event::JobClosed'
          AND created_at >= #{year_before_start}
          AND created_at < #{day_start} GROUP BY dxuser
        ) AS t6 ON t0.dxuser = t6.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param3) AS custom_price
          FROM events
          WHERE type = 'Event::JobClosed'
          AND created_at >= #{sql_date(custom_range_start)}
          AND created_at < #{sql_date(custom_range_end)}
          GROUP BY dxuser
        ) AS t7 ON t0.dxuser = t7.dxuser
        LEFT JOIN (
          SELECT dxuser, SUM(param3) AS cumulative_price
          FROM events
          WHERE type = 'Event::JobClosed'
          GROUP BY dxuser
        ) AS t8 ON t0.dxuser = t8.dxuser
        WHERE t0.dxuser != #{sanitized_bot_user};
      SQL
    end

    # Returns sanitized challenge bot's dxid.
    # @return [String] Sanitized dxid.
    def sanitized_bot_user
      ActiveRecord::Base.connection.quote(CHALLENGE_BOT_DX_USER)
    end

    # Returns aggregated price for given user at aggregation period.
    # @param user [User] User to aggregate price for.
    # @return [Numeric] Aggregated price.
    def custom_range_compute_price(user)
      Event::JobClosed.
        date_range(custom_range_start, custom_range_end).
        where(dxuser: user.dxuser).
        sum(:price)
    end

    # Returns aggregated consumed resources for given user at aggregated period.
    # @param user [User] User to aggregate resources for.
    # @return [Numeric] Aggregated resources.
    def custom_range_consumption(user)
      ::UsageCollector::CloudResource.consumption(custom_range_start, custom_range_end, user)
    end

    # Executes given SQL query.
    # @param sql [String] SQL query to execute.
    def execute(sql)
      ActiveRecord::Base.connection.execute(sql)
    end

    # Returns sanitized date for usage in SQL query.
    # @param date [Date] Date to sanitize.
    # @return [String] Sanitized date.
    def sql_date(date)
      ActiveRecord::Base.connection.quote(date.strftime("%Y-%m-%d"))
    end

    # Returns beginning of aggregation period.
    # @return [Time] Beginning of period.
    def custom_range_start
      Time.zone.parse(custom_range["date_from"]).beginning_of_day
    end

    # Returns end of aggregation period.
    # @return [Time] End of period.
    def custom_range_end
      Time.zone.parse(custom_range["date_to"]).end_of_day
    end

    # Returns aggregation period.
    # @return [Hash<String, Date>] Aggregation period.
    def custom_range
      Setting.usage_metrics_custom_range
    end
  end
end
# rubocop:enable Metrics/ClassLength

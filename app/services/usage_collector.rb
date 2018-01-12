class UsageCollector

  TABLE_NAME = 'usage_metrics'

  class << self

    def call(on_date = Date.today)
      ActiveRecord::Base.connection.execute(truncate_query)
      ActiveRecord::Base.connection.execute(collect_data_query(on_date))
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
          created_at
        ) SELECT
          t0.id AS user_id,
          (IFNULL(t1.storage, 0) - IFNULL(t2.storage, 0)) AS storage_usage,
          IFNULL(t3.day_price, 0) AS daily_compute_price,
          IFNULL(t4.week_price, 0) AS weekly_compute_price,
          IFNULL(t5.month_price, 0) AS monthly_compute_price,
          IFNULL(t6.year_price, 0) AS yearly_compute_price,
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
        WHERE t0.dxuser != #{ActiveRecord::Base.sanitize(CHALLENGE_BOT_DX_USER)};
      SQL
    end

    def sql_date(date)
      ActiveRecord::Base.sanitize(date.strftime("%Y-%m-%d"))
    end
  end

end

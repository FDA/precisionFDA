class UsageCollector

  TABLE_NAME = 'usage_metrics'

  def initialize(report_start = Date.today)
    @report_start = report_start
  end

  def call
    ActiveRecord::Base.connection.execute(truncate_query)
    ActiveRecord::Base.connection.execute(collect_data_query)
  end

  private

  attr_reader :report_start

  def truncate_query
    "TRUNCATE #{TABLE_NAME};"
  end

  def collect_data_query
    day_start = sql_date(report_start)
    day_current = sql_date(report_start + 1.day)
    day_ago = sql_date(report_start - 1.day)
    day_week_ago = sql_date(report_start - 1.week)
    day_month_ago = sql_date(report_start - 1.month)
    day_year_ago = sql_date(report_start - 1.year)

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
        (t1.storage - t2.storage) AS storage_usage,
        t3.day_price AS daily_compute_price,
        t4.week_price AS weekly_compute_price,
        t5.month_price AS monthly_compute_price,
        t6.year_price AS yearly_compute_price,
        NOW() as created_at
      FROM users AS t0
      LEFT JOIN (
        SELECT dxuser, SUM(param1) AS storage FROM events WHERE type = 'Event::FileCreated' AND created_at <= #{day_current} GROUP BY dxuser
      ) AS t1 ON t0.dxuser = t1.dxuser
      LEFT JOIN (
        SELECT dxuser, SUM(param1) AS storage FROM events WHERE type = 'Event::FileDeleted' AND created_at <= #{day_current} GROUP BY dxuser
      ) AS t2 ON t0.dxuser = t2.dxuser
      LEFT JOIN (
        SELECT dxuser, SUM(param3) AS day_price FROM events WHERE type = 'Event::JobClosed' AND created_at >= #{day_ago} AND created_at < #{day_start} GROUP BY dxuser
      ) AS t3 ON t0.dxuser = t3.dxuser
      LEFT JOIN (
        SELECT dxuser, SUM(param3) AS week_price FROM events WHERE type = 'Event::JobClosed' AND created_at >= #{day_week_ago} AND created_at < #{day_start} GROUP BY dxuser
      ) AS t4 ON t0.dxuser = t4.dxuser
      LEFT JOIN (
        SELECT dxuser, SUM(param3) AS month_price FROM events WHERE type = 'Event::JobClosed' AND created_at >= #{day_month_ago} AND created_at < #{day_start} GROUP BY dxuser
      ) AS t5 ON t0.dxuser = t5.dxuser
      LEFT JOIN (
        SELECT dxuser, SUM(param3) AS year_price FROM events WHERE type = 'Event::JobClosed' AND created_at >= #{day_year_ago} AND created_at < #{day_start} GROUP BY dxuser
      ) AS t6 ON t0.dxuser = t6.dxuser
      WHERE t0.dxuser != #{ActiveRecord::Base.sanitize(CHALLENGE_BOT_DX_USER)};
    SQL
  end

  def sql_date(date)
    ActiveRecord::Base.sanitize(date.strftime("%Y-%m-%d"))
  end
end

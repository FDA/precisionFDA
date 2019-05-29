module Admin
  class UsageReportsController < BaseController
    before_action :init_dates, only: :index

    def index
      @usage_grid = initialize_grid(
        usage_metric,
        order: "created_at",
        order_direction: "desc",
        per_page: 100,
        include: [:user],
        enable_export_to_csv: true,
        csv_file_name: "users_usage_#{Time.now.strftime('%Y-%m-%d')}",
        name: "usage"
      )

      export_grid_if_requested("usage" => "usage_grid")

      js(
        selected_range: @selected_range,
        custom_range_begin: @custom_range_begin,
        custom_range_end: @custom_range_end
      )
    end

    def update_custom_range
      Setting.set_value("selected_range", selected_range)

      if selected_range == "custom" && date_from && date_to
        Setting.set_usage_metrics_custom_range(date_from, date_to)
        Setting.set_value("custom_range_begin", params.dig(:custom_range, :date_from))
        Setting.set_value("custom_range_end", params.dig(:custom_range, :date_to))
        UsageCollector.collect_for_custom_range
      end

      redirect_to admin_usage_reports_path
    end

    private

    def init_dates
      @custom_range_begin = Setting.get_value("custom_range_begin")
      @custom_range_end = Setting.get_value("custom_range_end")
      @selected_range = Setting.get_value("selected_range").presence || "week"

      @storage_date = UsageMetric.where.not(storage_usage: nil).
                        order(:created_at).limit(1).pluck(:created_at).first
      @compute_date = (@storage_date - 1.day).end_of_day if @storage_date
    end

    def usage_metric
      metric = UsageMetric.joins(:user).where(users: { user_state: UsageMetric::USER_STATES })

      if @selected_range != "custom"
        metric.where.not("#{period}_compute_price" => nil, "#{period}_byte_hours" => nil)
      else
        metric
      end
    end

    def period
      case @selected_range
        when "day" then "daily"
        when "week" then "weekly"
        when "month" then "monthly"
        when "year" then "yearly"
        when "cumulative" then "cumulative"
        else "weekly"
      end
    end

    def selected_range
      params.dig(:custom_range, :selected_range).presence || "week"
    end

    def date_from
      (from = params.dig(:custom_range, :date_from)) && Date.parse(from)
    end

    def date_to
      (to = params.dig(:custom_range, :date_to)) && Date.parse(to)
    end
  end
end

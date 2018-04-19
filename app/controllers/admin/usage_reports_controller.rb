module Admin
  class UsageReportsController < BaseController

    def index
      custom_range = Setting.usage_metrics_custom_range
      @custom_range_begin = custom_range['date_from']
      @custom_range_end = custom_range['date_to']

      date_string = Time.now.strftime("%Y-%m-%d")

      @usage_grid = initialize_grid(UsageMetric,
        order: "created_at",
        order_direction: "desc",
        per_page: 100,
        include: [:user],
        enable_export_to_csv: true,
        csv_file_name: "users_usage_#{date_string}",
        name: "usage"
      )

      @storage_date = UsageMetric.order(created_at: :asc).limit(1).pluck(:created_at).first
      @compute_date = (@storage_date - 1.day).end_of_day if @storage_date

      export_grid_if_requested("usage" => "usage_grid")
    end

    def update_custom_range
      if date_from && date_to
        Setting.set_usage_metrics_custom_range(date_from, date_to)

        if UsageMetric.any?
          UsageCollector.collect_for_custom_range
        else
          UsageCollector.call
        end
      end

      redirect_to admin_usage_reports_path
    end

    private

    def date_from
      Date.parse(params['custom_range']['date_from'])
    end

    def date_to
      Date.parse(params['custom_range']['date_to'])
    end

  end

end

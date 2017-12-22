module Admin
  class UsageReportsController < BaseController

    def index
      date_string = Time.now.strftime("%Y-%m-%d")

      @usage_grid = initialize_grid(UsageMetric, {
        order: "created_at",
        order_direction: "desc",
        per_page: 100,
        include: [:user],
        enable_export_to_csv: true,
        csv_file_name: "users_usage_#{date_string}",
        name: "usage"
      })

      export_grid_if_requested("usage" => "usage_grid")
    end

  end
end

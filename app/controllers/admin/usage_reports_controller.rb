module Admin
  class UsageReportsController < BaseController

    def index
      @usage_grid = initialize_grid(UsageMetric, {
        order: "created_at",
        order_direction: "desc",
        per_page: 100,
        include: [:user],
        enable_export_to_csv: true,
        csv_file_name: "usage",
        name: "usage"
      })

      export_grid_if_requested("usage" => "usage_grid")
    end

  end
end

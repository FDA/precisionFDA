module Admin
  # Comparator settings
  class ComparatorSettingsController < BaseController
    layout "application"
    def index
      @global_default_comparator = App.find_by(dxid: DEFAULT_COMPARISON_APP) ||
                                   App.new(
                                     dxid: DEFAULT_COMPARISON_APP,
                                     title: DEFAULT_COMPARISON_APP,
                                   )

      comparator_apps = App.where(
        dxid: Setting.comparator_apps - [DEFAULT_COMPARISON_APP],
      )

      @comparators_grid = initialize_grid(
        comparator_apps,
        order: "app_series.name",
        order_direction: "asc",
      )
    end
  end
end

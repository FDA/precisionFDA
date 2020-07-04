# Helper for AppsController.
module AppsHelper
  # Determines if app is added to the comparators list
  # @param app [App] App to check.
  # @return [Boolean] Returns true if app is added to the comparators list.
  #   false otherwise.
  def app_added_to_comparators?(app)
    Setting.comparator_apps.include?(app.dxid)
  end

  # Determines if swap comparison app button should be shown.
  # @param context [Context] App context.
  # @param app [App] App to show button for.
  # @return [Boolean] Returns true if it's able to show swap comparison app button.
  #   false otherwise.
  def show_swap_comparison_app_button?(context, app)
    context.can_administer_site? &&
      app.scope == App::SCOPE_PUBLIC &&
      !default_comparator_app?(app) &&
      (app_added_to_comparators?(app) || global_comparison_app?(app))
  end

  # Determines if comparison app label should be shown.
  # @param context [Context] App context.
  # @param app [App] App to show button for.
  # @return [Boolean] Returns true if it's able to show comparison app label.
  #   false otherwise.
  def show_comparison_app_label?(context, app)
    context.can_administer_site? && app.dxid == Setting.comparison_app
  end

  def default_comparator_app?(app)
    Setting.comparison_app == app.dxid
  end

  def global_comparison_app?(app)
    app.dxid == DEFAULT_COMPARISON_APP
  end
end

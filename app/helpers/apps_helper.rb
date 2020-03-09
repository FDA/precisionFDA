# Helper for AppsController.
module AppsHelper
  # Determines if swap comparison app button should be shown.
  # @param context [Context] App context.
  # @param app [App] App to show button for.
  # @return [Boolean] Returns true if it's able to show swap comparison app button.
  #   false otherwise.
  def show_swap_comparison_app_button?(context, app)
    context.can_administer_site? &&
      app.scope == App::SCOPE_PUBLIC &&
      app.dxid != Setting.comparison_app
  end

  # Determines if comparison app label should be shown.
  # @param context [Context] App context.
  # @param app [App] App to show button for.
  # @return [Boolean] Returns true if it's able to show comparison app label.
  #   false otherwise.
  def show_comparison_app_label?(context, app)
    context.can_administer_site? && app.dxid == Setting.comparison_app
  end

  # Determines if restore comparison app button should be shown.
  # @param context [Context] App context.
  # @return [Boolean] Returns true if button should be shown, false otherwise.
  def show_restore_comparison_app_button?(context)
    context.can_administer_site? && Setting.comparison_app != DEFAULT_COMPARISON_APP
  end
end

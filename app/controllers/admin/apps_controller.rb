module Admin
  # Responsible for apps related actions.
  class AppsController < BaseController
    # Sets comparison app.
    def comparison_app
      app = App.find(params[:id])

      unless app.scope == App::SCOPE_PUBLIC
        flash[:error] = I18n.t("unable_to_set_comparsion_app")
        redirect_to(app_path(app))
        return
      end

      Setting.set_value(Setting::COMPARISON_APP, app.dxid)

      flash[:success] = I18n.t("comparison_app_set")
      redirect_to(app_path(app))
    end

    def restore_comparison_app
      Setting.find_by!(key: Setting::COMPARISON_APP).destroy!

      flash[:success] = "Default comparison app successfully restored."
      redirect_to admin_root_path
    end
  end
end

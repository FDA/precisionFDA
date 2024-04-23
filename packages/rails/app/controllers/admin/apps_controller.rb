module Admin
  # Responsible for apps related actions.
  class AppsController < BaseController
    before_action :check_app_scope, if: -> { DEFAULT_COMPARISON_APP != params[:dxid] }

    # Add an app to the comparators list.
    def add_to_comparators
      test_files = @app.input_spec.select do |input|
        input["class"] == "file" && input["name"].start_with?("test_")
      end

      if test_files.size.zero?
        render_error(I18n.t("app_no_test_inputs"))
        return
      end

      benchmark_files = @app.input_spec.select do |input|
        input["class"] == "file" && input["name"].start_with?("benchmark_")
      end

      if benchmark_files.size.zero?
        render_error(I18n.t("app_no_benchmark_inputs"))
        return
      end

      output_report_files = @app.output_spec.select do |output|
        output["class"] == "file" && output["name"].end_with?("html_report")
      end

      if output_report_files.size.zero?
        render_error(I18n.t("app_no_html_report_outputs"))
        return
      end

      setting_key = Setting::COMPARATOR_APPS

      Setting[setting_key] = (Setting.comparator_apps << @app.dxid).uniq

      head :ok
    end

    # Sets default comparison app.
    def set_comparison_app
      if DEFAULT_COMPARISON_APP == params[:dxid]
        Setting.find_by(key: Setting::COMPARISON_APP)&.destroy!
      elsif Setting.comparator_apps.include?(@app.dxid)
        Setting.set_value(Setting::COMPARISON_APP, @app.dxid)
      end

      head :ok
    end

    # Remove an app from the comparators list.
    def remove_from_comparators
      setting_key = Setting::COMPARATOR_APPS
      Setting[setting_key] = Setting.comparator_apps.tap { |dxids| dxids.delete(@app.dxid) }

      # If this app was a default comparator, remove this info as well.
      Setting.find_by(key: Setting::COMPARISON_APP, value: @app.dxid)&.destroy!

      head :ok
    end

    private

    # Check app's scope
    def check_app_scope
      @app = App.find_by!(dxid: params[:dxid])

      return if @app.scope == App::SCOPE_PUBLIC

      redirect_back(
        fallback_location: app_path(@app),
        flash: { error: I18n.t("unable_to_set_comparison_app") },
      )
    end

    # Renders error if app cannot be added to comparators list.
    # @param error [String] Error to render.
    def render_error(error)
      render json: { error: error }, status: :bad_request
    end
  end
end

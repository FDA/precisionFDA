module Api
  # Front controller that delegates call for Count per Section.
  class CountersController < ApiController
    CONTROLLERS = {
      "assets" => AssetsController,
      "dbclusters" => DbClustersController,
      "jobs" => JobsController,
      "files" => FilesController,
      "workflows" => WorkflowsController,
    }.freeze

    def index
      call_controller(:index)
    end

    def featured
      call_controller(:featured)
    end

    def everybody
      call_controller(:everybody)
    end

    def spaces
      call_controller(:spaces)
    end

    private

    def call_controller(method_name)
      counters = {}.tap do |count|
        CONTROLLERS.each do |key, controller|
          count[key] = init_controller(controller).send(method_name)
        end
      end

      counters[:reports] = SpaceReport.accessible_by_private.where(created_by: @context.user.id).count

      apps = if params[:action] == "spaces"
        AppSeries.editable_by(@context).where.not(scope: [Scopes::SCOPE_PUBLIC, Scopes::SCOPE_PRIVATE])
      else
        AppSeries.editable_by(@context).where(scope: Scopes::SCOPE_PRIVATE)
      end
      counters[:apps] = apps.count

      render json: counters
    end

    def init_controller(controller)
      controller.new.tap do |co|
        co.context = @context
        co.show_count = true

        co.request = request
        co.response = response
      end
    end
  end
end

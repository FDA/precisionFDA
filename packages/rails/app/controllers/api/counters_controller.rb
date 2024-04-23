module Api
  # Front controller that delegates call for Count per Section.
  class CountersController < ApiController
    CONTROLLERS = {
      "apps" => AppsController,
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

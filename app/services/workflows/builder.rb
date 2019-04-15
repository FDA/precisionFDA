module Workflows
  class Builder
    delegate :params, :context, :slot_objects, to: :presenter

    class << self
      def call(presenter)
        new(presenter).call
      end
    end

    def initialize(presenter)
      @presenter = presenter
    end

    def call
      ActiveRecord::Base.transaction do
        api = DNAnexusAPI.new(context.token)
        response = api.create_workflow(presenter.build)
        workflow = Workflow.create!(workflow_params(response))
        workflow.workflow_series.update!(latest_revision_workflow_id: workflow.id)
        workflow
      end
    end

    def spec_presenter
      @spec_presenter ||=
        Workflow::SpecificationPresenter.new(params, context, slot_objects)
    end

    private

    def workflow_params(response)
      presenter_params = spec_presenter.build
      presenter_params.merge(dxid: response["id"], edit_version: response["editVersion"])
    end

    attr_reader :presenter
  end
end

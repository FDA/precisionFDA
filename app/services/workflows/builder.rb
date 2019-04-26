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
        @api = DNAnexusAPI.new(context.token)
        create_assets if presenter.is_a?(Workflow::CwlPresenter)
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

    attr_reader :presenter, :api

    def workflow_params(response)
      presenter_params = spec_presenter.build
      presenter_params.merge(dxid: response["id"], edit_version: response["editVersion"])
    end

    def create_assets
      assets = presenter.assets
      presenter.parser.steps_objects.each do |step|
        asset = assets.find do |item|
          filename = File.basename(item.file_paths.first)
          step.docker_image == DockerImage.from_filename(filename)
        end
        next unless asset
        update_app(step, asset)
      end
    end

    def update_app(step, asset)
      assets = Asset.accessible_by(context).where(state: Asset::STATE_CLOSED, uid: asset.try(:uid))
      details = api.call(step.app.dxid, "describe")["details"]
      if details && details["ordered_assets"].empty?
        ordered_assets = assets.map(&:dxid)
        api.call(step.app.dxid, "update", details: { ordered_assets: ordered_assets })
        step.app.assets << asset
      end
    end
  end
end

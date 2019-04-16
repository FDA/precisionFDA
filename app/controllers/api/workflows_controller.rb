module Api
  class WorkflowsController < ApiController
    def create
      ActiveRecord::Base.transaction do
        if presenter.valid?
          workflow = Workflows::Builder.call(presenter)
          render json: { id: workflow.uid, asset_uids: presenter.assets.map(&:uid) }
        else
          render json: { errors: presenter.errors.full_messages }, status: :unprocessable_entity
        end
      end
    rescue => e
      logger.error e.message
      logger.error e.backtrace.join("\n")
      render json: { errors: ["Something went wrong"] }, status: :unprocessable_entity
    end

    def presenter
      @presenter ||= begin
        pr =
          if params[:file]
            klass = params[:format] == "wdl" ? Workflow::WdlPresenter : Workflow::CwlPresenter
            klass.new(params[:file], @context)
          else
            Workflow::Presenter.new(params, @context)
          end
        pr.attached_images = params[:attached_images] if pr.is_a?(Workflow::WdlPresenter)
        pr
      end
    end
  end
end

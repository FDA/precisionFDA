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
      logger.error(e.backtrace.unshift(e.message).join("\n"))

      message = if presenter.is_a?(Workflow::CwlPresenter) && e.message.include?("line")
        e.message.split(":").last.strip
      else
        e.message
      end

      render json: { errors: [message] }, status: :unprocessable_entity
    end

    private

    def presenter
      @presenter ||= begin
        klass = if unsafe_params[:file]
          unsafe_params[:format] == "wdl" ? Workflow::WdlPresenter : Workflow::CwlPresenter
        else
          Workflow::Presenter
        end

        klass.new(unsafe_params, @context)
      end
    end
  end
end

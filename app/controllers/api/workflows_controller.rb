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
      message = if presenter.is_a?(Workflow::CwlPresenter) && e.message.include?('line')
                  e.message.split(':').last.strip
                else
                  "Something went wrong"
                end
      render json: { errors: [message] }, status: :unprocessable_entity
    end

    def presenter
      @presenter ||= begin
          if params[:file]
            klass = params[:format] == "wdl" ? Workflow::WdlPresenter : Workflow::CwlPresenter
          else
            klass = Workflow::Presenter
          end
          klass.new(params, @context)
      end
    end
  end
end

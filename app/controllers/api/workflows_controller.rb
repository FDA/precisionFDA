module Api
  class WorkflowsController < ApiController
    before_action :can_copy_to_scope?, only: %i(copy)

    # Copies workflows to another scope.
    def copy
      workflows = Workflow.accessible_by(@context).where(id: params[:item_ids])

      new_workflows = workflows.map { |wf| copy_service.copy(wf, params[:scope]).first }

      # TODO: change old UI to handle json-response!
      respond_to do |format|
        format.html do
          redirect_to pathify(workflows.first),
                      success: "The workflow has been published successfully!"
        end

        format.json { render json: new_workflows, root: "workflows", adapter: :json }
      end
    end

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

    def copy_service
      @copy_service ||= CopyService.new(api: @context.api, user: current_user)
    end

    def can_copy_to_scope?
      scope = params[:scope]

      return if scope == Scopes::SCOPE_PUBLIC

      space = Space.from_scope(scope) if Space.valid_scope?(scope)

      raise ApiError, "Scope parameter is incorrect (can be public or space-x)" unless space

      return if space.editable_by?(current_user)

      raise ApiError, "You have no permissions to copy apps to the scope '#{scope}'"
    end
  end
end

class AnalysesController < ApplicationController
  include CloudResourcesConcern

  before_action :check_total_charges_limit, only: :new

  def new
    @workflow = Workflow.accessible_by(@context).find_by(uid: unsafe_params[:workflow_id])

    unless @workflow
      flash[:error] = I18n.t("workflow_not_accessible")
      redirect_to workflows_path
      return
    end

    js workflow: @workflow.slice(:uid, :spec, :title, :scope).merge(scopes: @workflow.accessible_scopes)
  end
end

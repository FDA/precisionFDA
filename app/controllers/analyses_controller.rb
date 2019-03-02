class AnalysesController < ApplicationController
  def new
    @workflow = Workflow.accessible_by(@context).find_by_uid(params[:workflow_id])
    if @workflow.nil?
      flash[:error] = "Sorry, this workflow does not exist or is not accessible by you"
      redirect_to workflows_path
      return
    end

    js workflow: @workflow.slice(:uid, :spec, :title).merge(scopes: @workflow.accessible_scopes)
  end
end

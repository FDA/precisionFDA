class AnalysesController < ApplicationController
  def new
    @workflow = Workflow.accessible_by(@context).find_by(dxid: params[:workflow_id])
    if @workflow.nil?
      flash[:error] = "Sorry, this workflow does not exist or is not accessible by you"
      redirect_to workflows_path
      return
    end

    js workflow: @workflow.slice(:dxid, :spec, :title)
  end
end

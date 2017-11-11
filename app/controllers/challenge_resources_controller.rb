class ChallengeResourcesController < ApplicationController
  skip_before_action :require_login, {only: []}
  before_action :require_login_or_guest, only: []

  def new
    @challenge = Challenge.find_by!(id: params[:challenge_id])
    if !@challenge.editable_by?(@context)
      redirect_to challenge_path(@challenge)
      return
    end
    js challenge_id: @challenge.id
  end

  def create
  end

  def destroy
    resource = ChallengeResource.where(user_id: @context.user_id, challenge_id: params[:challenge_id]).find_by!(id: params[:id])
    file = resource.user_file

    if !@context.logged_in? || !resource.editable_by?(@context)
      redirect_to challenge_path(challenge)
      return
    end

    resource.destroy!
    DNAnexusAPI.new(CHALLENGE_BOT_TOKEN).call(CHALLENGE_BOT_PRIVATE_FILES_PROJECT, "removeObjects", objects: [file.dxid])

    flash[:success] = "Challenge Resource \"#{resource.name}\" has been successfully deleted"
    redirect_to edit_page_challenge_path(params[:challenge_id], "resources")
  end

  private
    def file_params
      params.require(:file).permit(:name)
    end
end

class QueriesController < ApplicationController
  def create
    if request.post?
      @query = SavedQuery.create!(
        name: query_params[:name],
        description: query_params[:description],
        query: query_params[:query],
        user_id: @context.user_id,
        grid_name: query_params[:grid_name]
      )
      redirect_to truth_challenges_path(params[:page_tab])+"?query_id=#{@query.id}"
    end
  end

  def destroy
    sq = SavedQuery.find_by!(id: params[:id])
    if sq.user_id == @context.user_id || @context.user.can_administer_site?
      sq.destroy
    end
    # TODO: pass in params[:page_tab] instead of fixing tab
    redirect_to truth_challenges_path("results-explore")
  end

  private
    def query_params
      params.require(:saved_query).permit(:name, :query, :grid_name, :description, :user_id)
    end
end

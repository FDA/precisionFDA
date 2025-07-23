module Api
  # News Items API controller.
  class NewsItemsController < BaseController
    include Paginationable

    skip_before_action :require_api_login

    def show
      params.permit(:id)
      news_item = https_apps_client.news_show(params[:id])
      render json: news_item
    end

    def delete
      params.permit(:id)
      news_item = https_apps_client.news_delete(params[:id])
      render json: news_item
    end

    def create
      params.permit(:news_item)
      https_apps_client.news_create(params[:news_item])
    end

    def edit
      params.permit(:id, :news_item)
      https_apps_client.news_edit(params[:id], params[:news_item])
    end

    def positions
      params.permit(:news_items)
      https_apps_client.news_positions(params)
    end
  end
end

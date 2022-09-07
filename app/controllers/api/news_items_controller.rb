module Api
  # News Items API controller.
  class NewsItemsController < BaseController
    include Paginationable

    skip_before_action :require_api_login

    def index
      page = params[:page].presence || 1
      year = params[:year] =~ /\A\d+\Z/ ? params[:year].to_i : nil

      news_items = NewsItem.published.order(created_at: :desc).page(page)
      news_items = news_items.where(Arel.sql("YEAR(created_at) = #{year}")) if year

      render json: news_items,
             meta: pagination_dict(news_items),
             adapter: :json
    end

    def years
      all_years = NewsItem.published.order(created_at: :desc).pluck(:created_at).map(&:year).uniq
      render json: all_years
    end
  end
end

class NewsItemsController < ApplicationController
  skip_before_action :require_login, {only: [:index]}

  def index
    @news_items = NewsItem.published.positioned || []

    respond_to do |r|
      r.html
      r.json { render json: @news_items}
    end
  end
end

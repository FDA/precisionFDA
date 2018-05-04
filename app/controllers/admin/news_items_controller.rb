module Admin
  class NewsItemsController < BaseController
    include Rails.application.routes.url_helpers
    def create
        @news_item = NewsItem.new(news_item_params)
        @news_item.user = current_user if @context.logged_in?
      if @news_item.save
        redirect_to admin_news_items_url, alert: "News Item added"
      else
        render action: 'new'
      end
    end

    def new
      @news_item = NewsItem.new
    end

    def update
      @news_item = NewsItem.find(id_param[:id])
      if @news_item.update(news_item_params)
        redirect_to admin_news_items_path, alert: "News Item updated"
      else
        render 'edit'
      end
    end

    def destroy
      @news_post = NewsItem.find(id_param[:id])
      @news_post.destroy()
      redirect_to :back, alert: "News Item \"#{@news_post.title}\" deleted"
    end

    def index
      @news_items = NewsItem.positioned || []
      respond_to do |r|
        r.html
        r.json { render json: @news_items }
      end
    end

    def positions
      respond_to do |r|
        r.html
        r.json do
          items = params.require(:news_items)
          #source = NewsItem.find(items[0]['id'])
          #target = NewsItem.find(items[1]['id'])
          #NewsItem.where("position > ?", target.position).update_all('position = position + 1')  # shift items up
          #source.position = target.position + 1 # put new item in place we've just make
          items.each do |i|
            NewsItem.update(i["id"], position: i["position"])
          end
          render json: {'good to go':true}
        end
      end
    end

    def show
      @news_item = NewsItem.find(id_param[:id])
    end

    def edit
      @news_item = NewsItem.find(id_param[:id])
    end
    private
    def id_param
      params.permit(:id)
    end

    def news_item_params
      params.require(:news_item).permit(:title, :link, :content, :video, :published, :created_at)
    end
  end
end

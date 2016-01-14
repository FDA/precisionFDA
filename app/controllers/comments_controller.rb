class CommentsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :show]
  before_action :require_login_or_guest, only: [:index, :show]

  def index
    @itemsFromParams = get_item_array_from_params
    @item =  @itemsFromParams.last
    @item_path = pathify(@item)
    @item_comments_path = pathify_comments(@item)
    @comments = @item.root_comments.page params[:comments_page]
  end

  def show
    @itemsFromParams = get_item_array_from_params
    @item =  @itemsFromParams.last
    @item_path = pathify(@item)
    @item_comments_path = pathify_comments(@item)
    @comment = Comment.find_by(id: params[:id], user_id: @context.user_id)
  end

  def edit
    @itemsFromParams = get_item_array_from_params
    @item =  @itemsFromParams.last
    @item_path = pathify(@item)
    @item_comments_path = pathify_comments(@item)
    @comment = Comment.find_by(id: params[:id], user_id: @context.user_id)
  end

  def create
    if request.post?
      itemsFromParams = get_item_array_from_params
      item =  itemsFromParams.last
      item_comments_path = pathify_comments(item)
      c = comment_params
      if item.present?
        comment = Comment.build_from(item, @context.user_id, c[:body])
        if !comment.save
          flash[:error] = "There was a problem with adding your comment"
        end
        redirect_to item_comments_path
      else
        redirect_to root_url
      end
    else
      redirect_to root_url
    end
  end

  def update
    itemsFromParams = get_item_array_from_params
    item =  itemsFromParams.last
    item_comments_path = pathify_comments(item)
    comment = Comment.find_by(id: params[:id], user_id: @context.user_id)
    if !comment.nil?
      if comment.update_attributes(comment_params)
        redirect_to item_comments_path
        return
      else
        render 'edit'
      end
    end
  end

  def destroy
    itemsFromParams = get_item_array_from_params
    item =  itemsFromParams.last
    item_comments_path = pathify_comments(item)
    comment = Comment.find_by(id: params[:id], user_id: @context.user_id)
    if !comment.nil?
      comment.destroy
    else
      flash[:error] = "This comment could not be deleted"
    end

    redirect_to item_comments_path
  end

  private
    def comment_params
      params.require(:comment).permit(:body)
    end
end

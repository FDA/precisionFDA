class CommentsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :show]
  before_action :require_login_or_guest, only: [:index, :show]

  def index
    @items_from_params = get_item_array_from_params
    @item = @items_from_params.last
    if @item.accessible_by?(@context)
      @item_path = pathify(@item)
      @item_comments_path = pathify_comments(@item)
      @comments = @item.root_comments.page params[:comments_page]
    else
      flash[:error] = "You do not have permissions to comment on this item"
      redirect_to root_url
    end
  end

  def show
    @items_from_params = get_item_array_from_params
    @item = @items_from_params.last
    if @item.accessible_by?(@context)
      @item_path = pathify(@item)
      @item_comments_path = pathify_comments(@item)
      @comment = Comment.find_by!(id: params[:id], user_id: @context.user_id)
    else
      flash[:error] = "You do not have permissions to see this comment"
      redirect_to root_url
    end
  end

  def edit
    @items_from_params = get_item_array_from_params
    @item = @items_from_params.last
    if @item.accessible_by?(@context)
      @item_path = pathify(@item)
      @item_comments_path = pathify_comments(@item)
      @comment = Comment.find_by!(id: params[:id], user_id: @context.user_id)
    else
      flash[:error] = "You do not have permissions to edit this comment"
      redirect_to root_url
    end
  end

  def create
    if request.post?
      items_from_params = get_item_array_from_params
      item = items_from_params.last
      if item.present? && item.accessible_by?(@context)
        c = comment_params
        comment = Comment.build_from(item, @context.user_id, c[:body])
        if !comment.save
          flash[:error] = "There was a problem with adding your comment"
        end
        redirect_to pathify_comments_redirect(item)
      else
        flash[:error] = "You do not have permission to add a comment to this item"
        redirect_to root_url
      end
    else
      redirect_to root_url
    end
  end

  def update
    items_from_params = get_item_array_from_params
    item = items_from_params.last
    comment = Comment.find_by(id: params[:id], user_id: @context.user_id)
    if !comment.nil?
      if comment.update_attributes(comment_params)
        redirect_to pathify_comments_redirect(item)
        return
      else
        render 'edit'
      end
    end
  end

  def destroy
    items_from_params = get_item_array_from_params
    item =  items_from_params.last
    comment = Comment.find_by(id: params[:id], user_id: @context.user_id)
    if !comment.nil?
      comment.destroy
    else
      flash[:error] = "This comment could not be deleted"
    end

    redirect_to pathify_comments_redirect(item)
  end

  private
    def comment_params
      params.require(:comment).permit(:body)
    end
end

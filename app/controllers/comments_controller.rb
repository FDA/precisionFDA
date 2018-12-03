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
    @comment = Comment.find_by!(id: params[:id], user_id: @context.user_id)
    if @item.accessible_by?(@context) && @comment.active?
      @item_path = pathify(@item)
      @item_comments_path = pathify_comments(@item)
      if @item.klass == "space"
        user_ids = @item.space_memberships.active.map(&:user_id)
        users = User.find(user_ids).map {|u| {name: u.dxuser} }
      else
        users = nil
      end
    elsif @item.accessible_by?(@context) && @comment.deleted?
      redirect_to root_url
    else
      flash[:error] = "You do not have permissions to edit this comment"
      redirect_to root_url
    end

    js klass: @item.klass, users: users
  end

  def create
    items_from_params = get_item_array_from_params
    item = items_from_params.last
    if item.present? && item.accessible_by?(@context)
      if space_content_item?(item)
        space = item_from_uid(item.scope)
        comment = Comment.build_from(space, @context.user_id, comment_params[:body])
        comment.content_object = item
      end
      comment = Comment.build_from(item, @context.user_id, comment_params[:body]) unless comment
      comment = attach_content(comment, params)
      if comment.save
        move_to_child(comment)

        log_space_event(comment, item, "comment_added") if comment_inside_space?(item)
      else
        flash[:error] = "There was a problem with adding your comment"
      end
      redirect_to pathify_comments_redirect(item)
    else
      flash[:error] = "You do not have permission to add a comment to this item"
      redirect_to root_url
    end
  end

  def update
    items_from_params = get_item_array_from_params
    item = items_from_params.last
    comment = Comment.find_by(id: params[:id], user_id: @context.user_id)
    if !comment.nil?
      if comment.update_attributes(comment_params)
        log_space_event(comment, item, "comment_edited") if comment_inside_space?(item)
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
    if !comment.nil? && comment_inside_space?(item)
      comment.deleted!
      log_space_event(comment, item, "comment_deleted") if comment_inside_space?(item)
    elsif !comment.nil?
      comment.destroy
    else
      flash[:error] = "This comment could not be deleted"
    end

    redirect_to pathify_comments_redirect(item)
  end

  private
    def comment_params
      @comment_params ||= params.require(:comment).permit(:body, :parent_id)
    end

    def find_content_object(content_type, content_id)
      case content_type
      when "File"
        UserFile.find(content_id)
      else
        content_type.constantize.find(content_id)
      end
    end

    def attach_content(comment, params)
      if (content_type = params.dig(:comments_content, :content_type).presence) && (content_id = params.dig(:comments_content, :id).presence)
        comment.content_object = find_content_object(content_type, content_id)
      end
      comment
    end

    def space_content_item?(item)
      (item.klass != "space") && item.respond_to?(:scope) && item.in_space?
    end

    def comment_inside_space?(item)
      (item.klass == "space") || item.respond_to?(:scope) && item.in_space?
    end

    def move_to_child(comment)
      if comment_params[:parent_id].present?
        parent = Comment.find(comment_params[:parent_id])
        comment.move_to_child_of(parent)
        if parent.content_object
          comment.update(content_object: parent.content_object)
        end
      end
    end

    def log_space_event(comment, item, event)
      space =
        if item.klass == "space"
          item
        else
          item_from_uid(item.scope)
        end
      SpaceEventService.call(space.id, @context.user_id, nil, comment, event.to_sym)
    end
end

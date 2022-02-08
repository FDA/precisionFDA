class CommentsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :show]
  before_action :require_login_or_guest, only: [:index, :show]

  def index
    @items_from_params = get_item_array_from_params
    @item = @items_from_params.last
    if @item.accessible_by?(@context)
      @item_path = pathify(@item)
      @item_comments_path = pathify_comments(@item)
      if @item.in_space?
        space = item_from_uid(@item.scope)
        @comments = Comment.
          where(commentable: space, content_object: @item).
          order(id: :desc).
          page(unsafe_params[:comments_page])
      else
        @comments = @item.
          root_comments.order(id: :desc).
          page unsafe_params[:comments_page]
      end
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
      @comment = Comment.find_by!(id: unsafe_params[:id], user_id: @context.user_id)
    else
      flash[:error] = "You do not have permissions to see this comment"
      redirect_to root_url
    end
  end

  def edit
    @items_from_params = get_item_array_from_params
    @item = @items_from_params.last
    @comment = Comment.find_by!(id: unsafe_params[:id], user_id: @context.user_id)
    if @item.accessible_by?(@context) && @comment.active?
      @item_path = pathify(@item)
      @item_comments_path = pathify_comments(@item)
    elsif @item.accessible_by?(@context) && @comment.deleted?
      redirect_to root_url
    else
      flash[:error] = "You do not have permissions to edit this comment"
      redirect_to root_url
    end

    js klass: @item.klass
  end

  def create
    items_from_params = get_item_array_from_params
    item = items_from_params.last
    if item.present? && item.accessible_by?(@context)
      if comment_inside_space?(item)
        space = item_from_uid(item.scope)
        comment = Comment.build_from(space, @context.user_id, comment_params[:body])
        comment.content_object = item
      end
      comment = Comment.build_from(item, @context.user_id, comment_params[:body]) unless comment
      comment = attach_content(comment)
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
    comment = Comment.find_by(id: unsafe_params[:id], user_id: @context.user_id)

    return unless comment

    if comment.update(comment_params)
      log_space_event(comment, item, "comment_edited") if comment_inside_space?(item)
      redirect_to pathify_comments_redirect(item)
      return
    end

    render "edit"
  end

  def destroy
    items_from_params = get_item_array_from_params
    item =  items_from_params.last
    comment = Comment.find_by(id: unsafe_params[:id], user_id: @context.user_id)
    if comment && comment_inside_space?(item)
      comment.deleted!
      log_space_event(comment, item, "comment_deleted")
    elsif comment
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

  def attach_content(comment)
    if (content_type = unsafe_params.dig(:comments_content, :content_type).presence) && (content_id = unsafe_params.dig(:comments_content, :id).presence)
      comment.content_object = find_content_object(content_type, content_id)
    end
    comment
  end

  def comment_inside_space?(item)
    item.respond_to?(:scope) && item.in_space?
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
    space = item_from_uid(item.scope)
    SpaceEventService.call(space.id, @context.user_id, nil, comment, event.to_sym)
  end

  # Tries to find entity by provided data.
  # @raise [ActiveRecord::RecordNotFound] If entity could not be found.
  # @return [Array<Mixed>] Found entities array.
  def get_item_array_from_params
    if unsafe_params[:workflow_id].present?
      workflow = Workflow.find_by(uid: unsafe_params[:workflow_id])
      return [workflow]
    end

    if unsafe_params[:discussion_id].present?
      discussion = Discussion.find(unsafe_params[:discussion_id])

      return [discussion] if unsafe_params[:answer_id].blank?

      user = User.find_by!(dxuser: unsafe_params[:answer_id])
      answer = Answer.find_by!(discussion_id: unsafe_params[:discussion_id], user_id: user.id)
      [discussion, answer]
    elsif unsafe_params[:meta_appathon_id].present?
      meta_appathon = MetaAppathon.find(unsafe_params[:meta_appathon_id])

      return [meta_appathon] if unsafe_params[:appathon_id].blank?

      appathon = Appathon.find_by!(
        meta_appathon_id: unsafe_params[:meta_appathon_id],
        id: unsafe_params[:appathon_id],
      )

      [meta_appathon, appathon]
    elsif unsafe_params[:appathon_id].present?
      [Appathon.find(unsafe_params[:appathon_id])]
    elsif unsafe_params[:note_id].present?
      [Note.find(unsafe_params[:note_id])]
    elsif unsafe_params[:comparison_id].present?
      [Comparison.find(unsafe_params[:comparison_id])]
    elsif unsafe_params[:file_id].present?
      [UserFile.find_by!(uid: unsafe_params[:file_id])]
    elsif unsafe_params[:asset_id].present?
      [Asset.find_by!(uid: unsafe_params[:asset_id])]
    elsif unsafe_params[:job_id].present?
      [Job.find_by!(uid: unsafe_params[:job_id])]
    elsif unsafe_params[:app_id].present?
      [App.find_by!(uid: unsafe_params[:app_id])]
    elsif unsafe_params[:expert_id].present?
      expert = Expert.find(unsafe_params[:expert_id])

      if unsafe_params[:expert_question_id].present?
        return [expert, ExpertQuestion.find(unsafe_params[:expert_question_id])]
      end

      [expert]
    end
  end
end

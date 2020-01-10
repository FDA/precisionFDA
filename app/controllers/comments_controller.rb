class CommentsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :show]
  before_action :require_login_or_guest, only: [:index, :show]

  def index
    @items_from_params = get_item_array_from_params
    @item = @items_from_params.last
    if @item.accessible_by?(@context)
      @item_path = pathify(@item)
      @item_comments_path = pathify_comments(@item)
      @comments = @item.root_comments.page(unsafe_params[:comments_page])
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
    comment = Comment.find_by(id: unsafe_params[:id], user_id: @context.user_id)
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

  def attach_content(comment)
    if (content_type = unsafe_params.dig(:comments_content, :content_type).presence) && (content_id = unsafe_params.dig(:comments_content, :id).presence)
      comment.content_object = find_content_object(content_type, content_id)
    end
    comment
  end

  def space_content_item?(item)
    (item.klass != "space") && item.respond_to?(:scope) && item.in_space?
  end

  def comment_inside_space?(item)
    ["space", "task"].include?(item.klass) || item.respond_to?(:scope) && item.in_space?
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
      elsif item.klass == "task"
        item.space
      else
        item_from_uid(item.scope)
      end
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
      return [discussion, answer]
    elsif unsafe_params[:meta_appathon_id].present?
      meta_appathon = MetaAppathon.find(unsafe_params[:meta_appathon_id])

      return [meta_appathon] if unsafe_params[:appathon_id].blank?

      appathon = Appathon.find_by!(
        meta_appathon_id: unsafe_params[:meta_appathon_id],
        id: unsafe_params[:appathon_id],
      )

      return [meta_appathon, appathon]
    elsif unsafe_params[:appathon_id].present?
      return [Appathon.find(unsafe_params[:appathon_id])]
    elsif unsafe_params[:note_id].present?
      return [Note.find(unsafe_params[:note_id])]
    elsif unsafe_params[:task_id].present?
      task = Task.find(unsafe_params[:task_id])
      return [task.space, task]
    elsif unsafe_params[:space_id].present?
      return [Space.find(unsafe_params[:space_id])]
    elsif unsafe_params[:comparison_id].present?
      return [Comparison.find(unsafe_params[:comparison_id])]
    elsif unsafe_params[:file_id].present?
      return [UserFile.find_by!(uid: unsafe_params[:file_id])]
    elsif unsafe_params[:asset_id].present?
      return [Asset.find_by!(uid: unsafe_params[:asset_id])]
    elsif unsafe_params[:job_id].present?
      return [Job.find_by!(uid: unsafe_params[:job_id])]
    elsif unsafe_params[:app_id].present?
      return [App.find_by!(uid: unsafe_params[:app_id])]
    elsif unsafe_params[:expert_id].present?
      expert = Expert.find(unsafe_params[:expert_id])

      if unsafe_params[:expert_question_id].present?
        return [expert, ExpertQuestion.find(unsafe_params[:expert_question_id])]
      end

      return [expert]
    end
  end
end

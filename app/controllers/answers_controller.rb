class AnswersController < ApplicationController
  skip_before_action :require_login,     only: [:index, :show]
  before_action :require_login_or_guest, only: [:index, :show]

  def index
    discussion = Discussion.accessible_by(@context).find(unsafe_params[:discussion_id])
    redirect_to discussion_path(discussion)
  end

  def show
    username = unsafe_params[:id]
    user = User.find_by!(dxuser: username)
    @answer = Answer.where(discussion_id: unsafe_params[:discussion_id], user_id: user.id).take

    if @answer.nil?
      flash[:error] = "Sorry, this answer is not accessible"
      redirect_to discussions_path
      return
    else
      @discussion = @answer.discussion

      @items_from_params = [@discussion, @answer]
      @item_path = pathify(@answer)
      @item_comments_path = pathify_comments(@answer)
      @comments = @answer.root_comments.order(id: :desc).page unsafe_params[:comments_page]
      @commentable = @answer

      js note_js(@answer.note)
    end
  end

  def edit
    @user = User.find(@context.user_id)
    @answer = Answer.editable_by(@context).where(discussion_id: unsafe_params[:discussion_id], user_id: @user.id).take

    if @answer.nil?
      flash[:error] = "Sorry, this answer is not editable by you"
      redirect_to discussion_path(unsafe_params[:discussion_id])
      return
    else
      @note = @answer.note
      @discussion = @answer.discussion
      js note_js(@note)
    end
  end

  def create
    if request.post?
      Note.transaction do
        note = Note.create!({
          user_id: @context.user_id,
          scope: "private",
          note_type: "Answer"
        })
        Answer.transaction do
          discussion = Discussion.accessible_by(@context).find(unsafe_params[:discussion_id])
          @answer = Answer.create!(
            user_id: @context.user_id,
            note_id: note.id,
            discussion_id: discussion.id
          )
        end
      end

      redirect_to edit_discussion_answer_path(@answer.discussion.id, @answer.user.dxuser)
    end
  end

  def destroy
    answer = Answer.editable_by(@context).find_by!(discussion_id: unsafe_params[:discussion_id], user_id: @context.user_id)
    discussion_id = answer.discussion_id

    answer.destroy

    flash[:success] = "Answer has been successfully deleted"
    redirect_to discussion_path(discussion_id)
  end

  private
    def note_js(note)
      comparisons = note.comparisons
      files = note.real_files
      apps = note.apps
      jobs = note.jobs
      assets = note.assets

      attachments = {
        comparisons: (comparisons.map { |o| describe_for_api(o)}),
        files: (files.map { |o| describe_for_api(o)}),
        apps: (apps.map { |o| describe_for_api(o)}),
        jobs: (jobs.map { |o| describe_for_api(o)}),
        assets: (assets.map { |o| describe_for_api(o)}),
      }
      return {note: note.slice(:id, :content, :title), attachments: attachments, edit: unsafe_params[:edit], editable: note.editable_by?(@context)}
    end
end

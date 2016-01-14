class AnswersController < ApplicationController
  skip_before_action :require_login,     only: [:index, :show]
  before_action :require_login_or_guest, only: [:index, :show]

  def index
    discussion = Discussion.accessible_by(@context).find(params[:discussion_id])
    redirect_to discussion_path(discussion)
  end

  def show
    username = params[:id]
    user = User.find_by_dxuser(username)
    @answer = Answer.where(discussion_id: params[:discussion_id], user_id: user.id).take
    @discussion = @answer.discussion

    if @answer.nil?
      flash[:error] = "Sorry, this answer is not accessible"
      redirect_to discussions_path()
    end

    js note_js(@answer.note)
  end

  def edit
    @user = User.find(@context.user_id)
    @answer = Answer.editable_by(@context).where(discussion_id: params[:discussion_id], user_id: @user.id).take
    @note = @answer.note
    @discussion = @answer.discussion

    if @answer.nil?
      flash[:error] = "Sorry, this answer is not editable by you"
      redirect_to discussion_answer_path(@answer.discussion.id, @answer.user.dxuser)
      return
    end

    js note_js(@note)
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
          @answer = Answer.create!(
            user_id: @context.user_id,
            note_id: note.id,
            discussion_id: params[:discussion_id]
          )
        end
      end

      redirect_to edit_discussion_answer_path(@answer.discussion.id, @answer.user.dxuser)
    end
  end

  def destroy
    answer = Answer.editable_by(@context).where(discussion_id: params[:discussion_id], user_id: @context.user_id).take
    discussion_id = answer.discussion.id

    Answer.transaction do
      answer.note.destroy
      answer.destroy
    end

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
        comparisons: (comparisons.map { |o| o.context_slice(@context, :title)}),
        files: (files.map { |o| o.context_slice(@context, :title)}),
        apps: (apps.map { |o| o.context_slice(@context, :title)}),
        jobs: (jobs.map { |o| o.context_slice(@context, :title)}),
        assets: (assets.map { |o| o.context_slice(@context, :title)}),
      }
      return {note: note.slice(:id, :content, :title), attachments: attachments, edit: params[:edit], editable: note.editable_by?(@context)}
    end
end

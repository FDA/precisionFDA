class NotesController < ApplicationController
  skip_before_action :require_login,     only: [:index, :featured, :explore, :show]
  before_action :require_login_or_guest, only: [:index, :featured, :explore, :show]

  def index
    if @context.guest?
      redirect_to explore_notes_path
      return
    end

    @notes = Note.editable_by(@context).real_notes.order(id: :desc).page params[:notes_page]
  end

  def featured
    org = Org.featured
    if org
      @notes = Note.accessible_by(@context).real_notes.joins(:user).where(:users => { :org_id => org.id }).order(id: :desc).page params[:notes_page]
    end
    render :index
  end

  def explore
    @notes = Note.accessible_by_public.real_notes.order(id: :desc).page params[:notes_page]
    render :index
  end

  def show
    @note = Note.accessible_by(@context).find(params[:id])

    if @note.note_type == "Answer"
      redirect_to discussion_answer_path(@note.discussion, @note.user.dxuser)
    elsif @note.note_type == "Discussion"
      redirect_to discussion_path(@note.discussion)
    elsif request.path != note_path(@note)
      redirect_to @note
    else
      js note_js(@note)
    end
  end

  def edit
    @note = Note.editable_by(@context).find(params[:id])
    if @note.nil?
      redirect_to note_path(@note)
    elsif @note.note_type == "Answer"
      redirect_to discussion_answer_path(@note.discussion, @note.user.dxuser)
    elsif @note.note_type == "Discussion"
      redirect_to discussion_path(@note.discussion)
    end
    js note_js(@note)
  end

  def create
    if request.post?
      Note.transaction do
        @note = Note.create!(
          title: "Untitled Note (#{DateTime.now.strftime("%Y-%m-%d %H:%M:%S")})",
          user_id: @context.user_id,
          scope: "private"
        )
      end
      redirect_to note_path(@note)
    else
      redirect_to notes_path
    end
  end

  def destroy
    note = Note.editable_by(@context).find(params[:id])

    if note.real_note?
      note.destroy
      flash[:success] = "Note \"#{note.title}\" has been successfully deleted"
    end
    redirect_to :notes
  end

  private
    def note_params
      params.require(:note).permit(:content, :title)
    end

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

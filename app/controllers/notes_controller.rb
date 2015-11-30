class NotesController < ApplicationController
  def index
    @notes = Note.accessible_by(@context).order(id: :desc)
  end

  def show
    @note = Note.accessible_by(@context).find(params[:id])

    if request.path != note_path(@note)
      redirect_to @note
    else
      comparisons = @note.comparisons
      files = @note.real_files
      apps = @note.apps
      jobs = @note.jobs
      assets = @note.assets

      attachments = {
        comparisons: (comparisons.map { |o| o.context_slice(@context, :title)}),
        files: (files.map { |o| o.context_slice(@context, :title)}),
        apps: (apps.map { |o| o.context_slice(@context, :title)}),
        jobs: (jobs.map { |o| o.context_slice(@context, :title)}),
        assets: (assets.map { |o| o.context_slice(@context, :title)}),
      }
      js note: @note.slice(:id, :content, :title), attachments: attachments, edit: params[:edit]
    end
  end

  def new
    # TODO: GET routes should not have side-effects; convert this to a POST
    @note = Note.create!(
      title: "Untitled Note (#{DateTime.now.strftime("%Y-%m-%d %H:%M:%S")})",
      user_id: @context.user_id,
      scope: "private"
    )

    redirect_to note_path(@note, edit: true)
  end

  def destroy
    note = Note.where(user_id: @context.user_id).find(params[:id])

    note.destroy

    flash[:success] = "Note \"#{note.title}\" has been successfully deleted"
    redirect_to :notes
  end
end

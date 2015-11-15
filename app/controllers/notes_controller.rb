class NotesController < ApplicationController
  def index
    @notes = Note.accessible_by(@context).order(id: :desc)
  end

  def show
    @note = Note.accessible_by(@context).find(params[:id])

    if request.path != note_path(@note)
      redirect_to @note
    else
      comparisons = @note.comparisons.accessible_by(@context)
      files = @note.real_files.accessible_by(@context)
      apps = @note.apps.accessible_by(@context)
      jobs = @note.jobs

      attachments = {
        comparisons: (comparisons.map { |o| o.slice(:id, :name, :stats)}),
        files: (files.map { |o| o.slice(:id, :dxid, :name)}),
        apps: (apps.map { |o| o.slice(:id, :dxid, :title)}),
        jobs: (jobs.map { |o| o.slice(:id, :dxid, :name)})
      }
      js note: @note.slice(:id, :content, :title), attachments: attachments
    end
  end

  def new
    @note = Note.new({
      title: "Untitled Note (#{DateTime.now.strftime("%Y-%m-%d %H:%M:%S")})",
      user_id: @context.user_id,
      scope: "private"
    })

    @note.save
    redirect_to @note
  end

  def destroy
    note = Note.where(user_id: @context.user_id).find(params[:id])

    note.destroy

    flash[:success] = "Note \"#{note.title}\" has been successfully deleted"
    redirect_to :notes
  end
end

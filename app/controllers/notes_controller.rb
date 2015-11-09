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

  def update
    id = params[:id].to_i
    raise unless id.is_a?(Integer)

    attachments = params[:attachments]
    # raise unless attachments.is_a?(Array)

    updated = false
    note = Note.find(params[:id])
    if note[:user_id] == @context.user_id
      Note.transaction do
        note.attachments.destroy_all
        attachments.each do |attachment|
          # NOTE: I'm not sure why its send attachments in such a format
          note.attachments.find_or_create_by(item_id: attachment[1][:id].to_i, item_type: attachment[1][:type])
        end

        params = note_params()
        if note.update!(params)
          updated = true
          note.reload
        end
      end
    end

    render json: {
      success: updated,
      note: {
        id: note.id,
      },
      path: note_path(note)
    }
  end

  def destroy
    note = Note.where(user_id: @context.user_id).find(params[:id])

    note.destroy

    flash[:success] = "Note \"#{note.title}\" has been successfully deleted"
    redirect_to :notes
  end

  private

  def note_params
    params.require(:note).permit(:title, :content)
  end
end

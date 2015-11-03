class NotesController < ApplicationController
  def index
    @notes_toolbar = {
      fixed: [
        {icon: "fa fa-sticky-note fa-fw", label: "New Note", link: new_note_path}
      ]
    }

    notes = Note.accessible_by(@context)
    @notes_grid = initialize_grid(notes, {
      order: 'notes.title',
      order_direction: 'asc',
      per_page: 100
    })
  end

  def show
    @note = Note.accessible_by(@context).find(params[:id])

    if request.path != note_path(@note)
      redirect_to @note
    else
      @comparisons = Comparison.accessible_by(@context).where(state: "done")
      @files = UserFile.real_files.accessible_by(@context)

      if @note[:user_id] == @context.user_id
        js note: @note.slice(:id, :content, :title), comparisons: (@comparisons.map { |c| c.slice(:id, :name, :stats)}), files: (@files.map { |f| f.slice(:dxid, :name)})
      end
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
    updated = false
    note = Note.find(params[:id])
    if note[:user_id] == @context.user_id
      Note.transaction do
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

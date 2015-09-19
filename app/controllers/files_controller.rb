class FilesController < ApplicationController
  def index
    @toolbar = {
      fixed: [
        {icon: "fa fa-plus-square fa-fw", label: "Add Files", link: new_file_path}
      ]
    }

    # Refresh state of files, if needed
    User.sync_files!(@context.user_id, @context.token)

    user_files = UserFile.accessible_by(@context.user_id)
    @files_grid = initialize_grid(user_files,{
      include: [:user, :biospecimen],
      order: 'user_files.id',
      order_direction: 'desc',
      per_page: 100
    })
  end

  def show
    @file = UserFile.accessible_by(@context.user_id).includes(:user, :biospecimen).find_by!(dxid: params[:id])

    # Refresh state of file, if needed
    if @file.state != "closed"
      User.sync_file!(@context.user_id, @file.id, @context.token)
      @file.reload
    end

    @comparisons_grid = initialize_grid(@file.comparisons,{
      order: 'comparisons.id',
      order_direction: 'desc',
      per_page: 10
    })
  end

  def new
    @biospecimens = Biospecimen.all
  end

  # TODO: Delete file on DNANEXUS API
  # FIXME: If a file is connected to a comparison you can't delete it?
  def destroy
    @file = UserFile.accessible_by(@context.user_id).find_by!(dxid: params[:id])
    filename = @file.name
    if @file
      @file.destroy
      flash[:success] = "File \"#{filename}\" has been successfully deleted"
      redirect_to files_path
    end
  end
end

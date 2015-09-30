class FilesController < ApplicationController
  def index
    @toolbar = {
      fixed: [
        {icon: "fa fa-plus-square fa-fw", label: "Add Files", link: new_file_path}
      ]
    }

    # Refresh state of files, if needed
    User.sync_files!(@context.user_id, @context.token)

    user_files = UserFile.real_files.accessible_by(@context.user_id)
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

    if @file.parent_type != "Comparison"
      User.sync_comparisons!(@context.user_id, @context.token)

      @comparisons_grid = initialize_grid(@file.comparisons.accessible_by(@context.user_id), {
        order: 'comparisons.id',
        order_direction: 'desc',
        per_page: 10
      })
    else
      @comparison = @file.parent
    end
  end

  def new
    @biospecimens = Biospecimen.all
  end

  def download
    @file = UserFile.accessible_by(@context.user_id).find_by!(dxid: params[:id])
    logger.debug params

    # Refresh state of file, if needed
    if @file.state != "closed"
      User.sync_file!(@context.user_id, @file.id, @context.token)
      @file.reload
    end

    if @file.state != "closed"
      flash[:error] = "Files can only be downloaded if they are in the 'closed' state"
      redirect_to file_path(@file.dxid)
    else
      redirect_to DNAnexusAPI.new(@context.token).call(@file.dxid, "download", {filename: @file.name, project: @file.project, preauthenticated: true})["url"] + (params[:inline] == "true" ? '?inline' : '')
    end
  end

  def destroy
    @file = UserFile.real_files.accessible_by(@context.user_id).find_by!(dxid: params[:id])

    if @file
      projectID = @file.project
      dxid = @file.dxid
      filename = @file.name

      if @file.comparisons.size == 0
        # Delete from dB
        UserFile.transaction do
          @file.reload
          if @file.state == "open"
            user = User.find(@context.user_id)
            user.open_files_count = user.open_files_count - 1
            user.save!
          elsif @file.state == "closing"
            user = User.find(@context.user_id)
            user.closing_files_count = user.closing_files_count - 1
            user.save!
          end
          @file.destroy
        end

        if @file.destroyed?
          # Delete on DNANEXUS API
          DNAnexusAPI.new(@context.token).(projectID, "removeObjects", objects: [dxid])

          # On Success
          flash[:success] = "File \"#{filename}\" has been successfully deleted"
          redirect_to files_path
          return
        else
          flash[:error] = "Sorry, the file \"#{filename}\" could not be deleted"
        end
      else
        flash[:error] = "Sorry, the file \"#{filename}\" could not be deleted as it is used in a comparison"
      end
    else
      flash[:error] = "The file with id \"#{ params[:id]}\" could not be found"
    end
    redirect_to file_path(@file.dxid)
  end
end

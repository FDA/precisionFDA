class FilesController < ApplicationController
  def index
    @toolbar = {
      fixed: [
        {icon: "fa fa-plus-square fa-fw", label: "Add Files", link: new_file_path}
      ]
    }

    user_files = UserFile.where("user_files.user_id = ? OR user_files.public = ?", @context.user_id, true)
    @files_grid = initialize_grid(user_files,
      include: [:user, :biospecimen],
      order: 'user_files.id',
      order_direction: 'desc',
      per_page: 100
    )
  end

  def show
    @file = UserFile.find_by("user_files.id = ? AND (user_files.user_id = ? OR user_files.public = ?)", params[:id], @context.user_id, true)
  end

  def new
  end
end

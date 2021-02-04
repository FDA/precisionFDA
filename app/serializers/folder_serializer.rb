# Folder serializer.
class FolderSerializer < NodeSerializer
  attributes(
    :path,
    :created_at_date_time,
    :links,
  )

  def path
    @built = []
    add_to_built(object.id, object.name)
    build_path(object)
  end

  def links
    return {} unless current_user

    {}.tap do |links|
      unless object.in_space? && member_viewer?
        # POST /api/folders/rename_folder
        links[:rename_folder] = rename_folder_api_folders_path(object)
        # POST: Move file(s) and folder()s) to other folder
        links[:organize] = move_api_files_path
        # POST: /api/files/remove - Delete file(s) & folder(s), being selected
        links[:remove] = remove_api_files_path
      end
      links[:publish] = publish_folders_api_folders_path if current_user.can_administer_site?
      links[:user] = user_path(object.user.dxuser)
      links[:space] = space_path if object.in_space?
      links[:copy] = copy_api_files_path
      links[:children] = children_api_folders_path
    end
  end

  private

  def build_path(folder)
    parent = folder.parent_folder
    parent ? add_to_built(parent.id, parent.name) : add_to_built(nil, "/")
  end

  def add_to_built(id, name)
    @built << { id: id, name: name }
  end
end

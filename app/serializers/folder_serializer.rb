# Folder serializer.
class FolderSerializer < NodeSerializer
  attributes(:path)

  def path
    @built = []
    add_to_built(object.id, object.name)
    build_path(object)
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

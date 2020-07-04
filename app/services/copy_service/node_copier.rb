class CopyService
  # Copies files and folders (with children) recursively to another scope.
  class NodeCopier
    def initialize(api:, user:)
      @api = api
      @user = user
      @file_copier = FileCopier.new(api: api, user: user)
    end

    # Copies files and folders recursively to another scope.
    # @param nodes [Node::ActiveRecord_Relation, Array<Node>] Nodes.
    # @param scope [String] A destination scope.
    # @return [CopyService::Copies] An object that contains copied files and/or folders.
    def copy(nodes, scope)
      copies = Copies.new

      return copies if nodes.empty?

      @parent_folder_col = Node.scope_column_name(scope)

      parent_folder = nil

      nodes.each { |node| copies.concat(copy_node(node, scope, parent_folder)) }

      copies
    end

    private

    attr_reader :api, :user, :file_copier

    # Copies a node and its children to a destination scope.
    # @param folder [Node] A node (folder or file) to copy.
    # @param scope [String] A destination scope.
    # @return [CopyService::Copies] An object that contains copied files and/or folders.
    def copy_node(node, scope, parent_folder = nil)
      if node.is_a?(Folder)
        copy_folder(node, scope, parent_folder)
      else
        copy_file(node, scope, parent_folder)
      end
    end

    # Copies a folder and its children to a destination scope.
    # @param folder [Folder] A folder to copy.
    # @param scope [String] A destination scope.
    # @param parent_folder [Folder, nil] A parent folder of a folder.
    # @return [CopyService::Copies] An object that contains copied files and folders.
    # rubocop:disable Metrics/MethodLength
    def copy_folder(folder, scope, parent_folder = nil)
      copies = Copies.new

      existed_folder = Folder.find_by(
        scope: scope,
        name: folder.name,
        @parent_folder_col => parent_folder&.id,
      )

      if existed_folder
        copies.push(
          object: existed_folder,
          source: folder,
          copied: false,
        )

        return copies
      end

      copied_folder = folder.dup.tap do |new_folder|
        new_folder.scope = scope
        new_folder.user = user
        new_folder[@parent_folder_col] = parent_folder&.id
        new_folder.save!
      end

      copies.push(
        object: copied_folder,
        source: folder,
        copied: true,
      )

      folder.children.each do |child_node|
        if child_node.is_a?(Folder)
          copies.concat(copy_folder(child_node, scope, copied_folder))
        else
          copies.concat(copy_file(child_node, scope, copied_folder))
        end
      end

      copies
    end
    # rubocop:enable Metrics/MethodLength

    # Copies a file to a destination scope.
    # @param file [UserFile] A file to copy.
    # @param scope [String] A destination scope.
    # @param parent_folder [Folder, nil] A parent folder of a file.
    # @return [CopyService::Copies] An object that contains copied and source files.
    def copy_file(file, scope, parent_folder = nil)
      copies = file_copier.copy(file, scope)
      file_copy = copies[0]
      file_copy.object.update!(@parent_folder_col => parent_folder&.id) if file_copy&.copied
      copies
    end
  end
end

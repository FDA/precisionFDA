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
    def copy(nodes, scope, folder_id)
      copies = Copies.new

      return copies if nodes.empty?

      @parent_folder_col = Node.scope_column_name(scope)
      @opposite_parent_folder_col = Node.opposite_scope_column_name(scope)

      parent_folder = Node.find_by(id: folder_id)

      Node.transaction do
        nodes.each do |node|
          copied_node = copy_node(node, scope, parent_folder)
          copies.concat(copied_node)
        end
      end

      copies
    end

    private

    attr_reader :api, :user, :file_copier

    # Copies a node and its children to a destination scope.
    # @param folder [Node] A node (folder or file) to copy.
    # @param scope [String] A destination scope.
    # @return [CopyService::Copies] An object that contains copied files and/or folders.
    def copy_node(node, scope, parent_folder = nil)
      Rails.logger.info("NodeCopier::copy_node #{node.id}, scope #{scope}")
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
    # rubocop:todo Metrics/MethodLength
    def copy_folder(folder, scope, parent_folder = nil)
      Rails.logger.info("NodeCopier::copy_folder id #{folder.id} name #{folder.name} to scope #{scope}")
      copies = Copies.new

      copied_folder = if scope == Scopes::SCOPE_PRIVATE
        Folder.find_by(
          scope: scope,
          name: folder.name,
          user: @user,
          @parent_folder_col => parent_folder&.id,
        )
      else
        Folder.find_by(
          scope: scope,
          name: folder.name,
          @parent_folder_col => parent_folder&.id,
        )
      end

      copied_folder ||= folder.dup.tap do |new_folder|
        new_folder.scope = scope
        new_folder.user = user
        new_folder.project = nil if Space.valid_scope?(scope)
        new_folder.parent_id = folder.id
        new_folder.parent_type = folder.sti_type
        new_folder[@parent_folder_col] = parent_folder&.id
        new_folder[@opposite_parent_folder_col] = nil
        new_folder.locked = false
        new_folder.save!
      end

      Rails.logger.info("NodeCopier::copy_folder copied folder id #{copied_folder.id} name #{copied_folder.name}")

      copies.push(
        object: copied_folder,
        source: folder,
        copied: true,
      )

      folder.children.each do |child_node|
        if child_node.is_a?(Folder)
          copies.concat(copy_folder(child_node, scope, copied_folder))
        else
          copied_file = UserFile.find_by(dxid: child_node.dxid, scope:, @parent_folder_col => copied_folder&.id)

          next if copied_file

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
      Rails.logger.info("NodeCopier::copy_file id #{file.id} uid #{file.uid} name #{file.name} to scope #{scope}")

      file_copier.copy(file, scope, parent_folder&.id)
    end
  end
end

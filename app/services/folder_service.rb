class FolderService
  class Error < StandardError; end

  ROOT_DIR = "root".freeze

  def initialize(context)
    @context = context
  end

  # Find a set of matched names between folders to be published and
  #   all public folders exist.
  # @param folders_names [Array] - a collection of Folder objects.
  # @return [Array] - a set of matched names
  def find_match_names(folders)
    folders_names = folders_names(folders)
    public_folders_names = Folder.accessible_by_public.pluck(:name).uniq
    folders_names & public_folders_names
  end

  def add_folder(name, parent_folder = nil, scope = Scopes::SCOPE_PRIVATE)
    if parent_folder && !parent_folder.editable_by?(context)
      return Rats.failure(
        message: "You have no permissions to add objects to #{parent_folder.name}.",
      )
    elsif parent_folder&.https?
      return Rats.failure(message: "You're not allowed to add objects to an HTTPS folder.")
    end

    computed_scope = parent_folder&.scope || scope
    scope_column_name = Node.scope_column_name(computed_scope)

    folder = Folder.new(
      name: name,
      parent: context.user,
      scope: computed_scope,
      user: context.user,
      scope_column_name => parent_folder&.id,
    )

    return Rats.failure(folder.errors.messages) unless folder.save

    Event::FolderCreated.create_for(folder, context.user)
    Rats.success(folder)
  end

  def rename(folder, new_name)
    unless folder.editable_by?(context)
      return Rats.failure(message: "You have no permissions to rename '#{folder.name}'.")
    end

    if folder.in_locked_verification_space?
      return Rats.failure(
        message: "You have no permissions to remove '#{folder.name}', " \
                 "as it is part of Locked Verification space."
      )
    end

    return rename_https_folder(folder, new_name) if folder.https?

    folder.name = new_name
    folder.save ? Rats.success(folder) : Rats.failure(message: folder.errors.messages.first)
  end

  def move(nodes, target_folder = nil, scope = Scopes::SCOPE_PRIVATE)
    return Rats.failure(message: "No files/folders selected.") if nodes.empty?

    validate_target_folder!(target_folder)
    validate_nodes_to_move!(nodes, target_folder, scope)

    nodes.each { |node| node.update(Node.scope_column_name(scope) => target_folder&.id) }

    if nodes.all?(&:valid?)
      Rats.success(count: nodes.size, scope: scope)
    else
      Rats.failure(messages: "An error occurred during the saving to the database.")
    end
  rescue Error => e
    Rats.failure(message: e.message)
  rescue StandardError
    Rats.failure(message: "Something went wrong.")
  end

  def remove(nodes)
    return Rats.failure(message: "No objects selected.") if nodes.blank?

    res = nil

    nodes.each do |node|
      unless node.editable_by?(context)
        return Rats.failure(message: "You have no permissions to remove '#{node.name}'.")
      end

      if node.in_locked_verification_space?
        return Rats.failure(
          message: "You have no permissions to remove '#{node.name}', " \
                   "as it is part of Locked Verification space."
        )
      end

      res = node.is_a?(Folder) ? remove_folder(node) : remove_file(node)

      break unless res.success?
    end

    res
  end

  private

  attr_reader :context

  # Collect names of folders and folder's children - use for names check when publishing.
  # @param folders [A collection of Folder objects]
  # @return folders_children_names [Array] - names of folder's children folders
  def folders_names(folders)
    folders_names = folders.pluck(:name)

    folders_children_names = []
    folders.each do |folder|
      sub_folders = folder.sub_folders.pluck(:name)
      folders_children_names += sub_folders unless sub_folders.empty?
    end

    folders_names += folders_children_names unless folders_children_names.empty?
    folders_names
  end

  # Validates nodes.
  # @param nodes [ActiveRecord::Relation<Node>] Nodes to move.
  def validate_nodes_to_move!(nodes, target_folder, target_scope)
    nodes.each do |node|
      raise Error, "You're not allowed to move an HTTPS #{node.klass}." if node.https?

      if node.public? && !context.can_administer_site? || !node.accessible_by?(context)
        raise Error, "You have no permissions to move '#{node.name}'."
      end

      # Verification spaces are deprecated.
      if node.in_locked_verification_space?
        raise Error, "You have no permissions to move '#{node.name}', " \
                     "as it is part of Locked Verification space."
      end

      next unless node.is_a?(Folder)

      raise Error, "Unexpected scope." if node.scope != target_scope && !node.private?

      if target_folder && (node == target_folder || node.has_in_children?(target_folder))
        raise Error, "Unable to move folder into itself or its child folder."
      end
    end
  end

  # Validates target folder for moving nodes.
  # @param target_folder [Folder] The target folder.
  def validate_target_folder!(target_folder)
    return unless target_folder

    raise Error, "You're not allowed to move to an HTTPS folder." if target_folder.https?

    return if target_folder.editable_by?(context)

    raise Error, "You have no permissions to add objects to '#{target_folder.name}'."
  end

  def remove_folder(folder)
    if folder.public? && folder.all_files.present?
      return Rats.failure(message: "#{folder.name}: folder or any of its subfolders contain files.")
    end

    folder.https? ? remove_https_folder(folder) : remove_regular_folder(folder)
  end

  def remove_regular_folder(folder)
    folder.sub_folders.each do |sub_folder|
      res = remove_folder(sub_folder)
      return res if res.failure?
    end

    folder_files = folder.files.where(scope: folder.scope)
    folder_files.each do |file|
      res = remove_file(file)

      return res if res.failure?
    end

    folder.destroy

    if folder.destroyed?
      Event::FolderDeleted.create_for(folder, context.user)
      Rats.success(folder)
    else
      Rats.failure(message: "#{folder.name}: folder removal error.")
    end
  end

  # Removes https folder and all its childs via Https Apps service.
  # @param folder [Folder] A folder.
  def remove_https_folder(folder)
    nodejs_api_client.folder_remove(folder.id)

    Rats.success(folder)
  rescue HttpsAppsClient::Error => e
    Rats.failure(message: e.message)
  end

  def rename_https_folder(folder, new_name)
    nodejs_api_client.folder_rename(folder.id, new_name)

    Rats.success(folder)
  rescue HttpsAppsClient::Error => e
    Rats.failure(message: e.message)
  end

  def remove_file(file)
    if file.comparisons.count > 0
      return Rats.failure(
        message: "File #{file.name} cannot be deleted because it participates in one or " \
                 "more comparisons. Please delete all the comparisons first.",
      )
    end

    if Participant.where(file: file).exists? && file.in_locked_verification_space?
      return Rats.failure(
        message: "You have no permissions to remove '#{file.name}', " \
                 "as it is part of Locked Verification space.",
      )
    end

    # remove the file from the platform only when it's the last with given dxid
    if UserFile.where(dxid: file.dxid).count == 1
      Rails.logger.info "FolderService::remove_file removing file #{file.dxid} from platform"
      begin
        DNAnexusAPI.new(context.token).call(file.project, "removeObjects", objects: [file.dxid])
      rescue DXClient::Errors::NotFoundError
        # do nothing
      end
    end

    UserFile.transaction { file.destroy }

    return Rats.failure(message: "#{file.name}: file removal error.") unless file.destroyed?

    Event::FileDeleted.create_for(file, context.user)

    if file.scope =~ /^space-(\d+)$/
      event_type = file.klass == "asset" ? :asset_deleted : :file_deleted

      SpaceEventService.call(
        Regexp.last_match(1).to_i,
        context.user_id,
        nil,
        file,
        event_type,
        nodejs_api_client,
      )
    end

    Rats.success(file)
  end

  def nodejs_api_client
    @nodejs_api_client ||= HttpsAppsClient.new(context.token, context.user)
  end
end

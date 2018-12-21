class FolderService

  def initialize(context)
    @context = context
  end

  def add_folder(name, parent_folder = nil, scope = "private")
    if parent_folder
      unless parent_folder.editable_by?(context)
        return Rats.failure(message: "You have no permissions to add objects to #{parent_folder.name}")
      end
      computed_scope = parent_folder.scope
      parent_folder_id = parent_folder.id
    else
      computed_scope = scope
      parent_folder_id = nil
    end

    scope_column_name = Node.scope_column_name(computed_scope)

    folder = Folder.new(
      name: name,
      parent: context.user,
      scope: computed_scope,
      user: context.user
    )
    folder[scope_column_name] = parent_folder_id

    folder.save ? Rats.success(folder) : Rats.failure(folder.errors.messages)
  end

  def rename(folder, new_name)
    unless folder.editable_by?(context)
      return Rats.failure(message: "You have no permissions to rename '#{folder.name}'")
    end

    return Rats.failure(message: "You have no permissions to remove '#{folder.name}', as it is part of Locked Verification space.") if folder.in_locked_verificaiton_space?

    folder.name = new_name
    folder.save ? Rats.success(folder) : Rats.failure(folder.errors.messages)
  end

  def move(nodes, target_folder = nil, scope = "private")
    return Rats.failure(message: "No files selected") unless nodes.present?

    if target_folder
      unless target_folder.editable_by?(context)
        return Rats.failure(message: "You have no permissions to add objects to '#{target_folder.name}'")
      end
      computed_scope = target_folder.scope
      target_folder_id = target_folder.id
    else
      computed_scope = scope
      target_folder_id = nil
    end

    scope_column_name = Node.scope_column_name(computed_scope)
    errors = []

    nodes.each do |node|
      unless (node.public? && context.user.can_administer_site?) || node.editable_by?(context)
        errors << "You have no permissions to move '#{node.name}'"
        break
      end

      errors << "You have no permissions to move '#{node.name}', as it is part of Locked Verification space." if node.in_locked_verificaiton_space?

      if node.is_a?(Folder)
        if node.scope != computed_scope && !node.private?
          return Rats.failure(message: "Unexpected scope")
        end

        if target_folder.present? && (node == target_folder || node.has_in_children?(target_folder))
          return Rats.failure(message: "Unable to move folder into itself or its child folder")
        end
      end

      node[scope_column_name] = target_folder_id
      errors << node.errors.messages.values unless node.save
    end

    errors.empty? ? Rats.success(count: nodes.size, scope: scope) : Rats.failure(messages: errors.uniq)
  end

  def remove(nodes)
    return Rats.failure(message: "No objects selected") if nodes.blank?

    res = nil

    nodes.each do |node|
      return Rats.failure(message: "You have no permissions to remove '#{node.name}'") unless node.editable_by?(context)
      return Rats.failure(message: "You have no permissions to remove '#{node.name}', as it is part of Locked Verification space.") if node.in_locked_verificaiton_space?
      res = node.is_a?(Folder) ? remove_folder(node) : remove_file(node)
      break unless res.success?
    end

    res
  end

  private

  attr_reader :context

  def remove_folder(folder)
    if folder.public? && folder.all_files.present?
      return Rats.failure(message: "#{folder.name}: folder or any of its subfolders contain files.")
    end

    folder.sub_folders.each do |sub_folder|
      res = remove_folder(sub_folder)
      return res unless res.success?
    end

    folder.files.each do |file|
      res = remove_file(file)
      return res unless res.success?
    end

    folder.destroy
    folder.destroyed? ? Rats.success(folder) : Rats.failure(message: "#{folder.name}: folder removal error")
  end

  def remove_file(file)
    if file.comparisons.count > 0
      return Rats.failure(message: "File #{file.name} cannot be deleted because it participates in one or more comparisons. Please delete all the comparisons first.")
    end

    if Participant.by_file(file).any?
      return Rats.failure(message: "You have no permissions to remove '#{file.name}', as it is part of Locked Verification space.") if file.in_locked_verificaiton_space?
    end

    begin
      DNAnexusAPI.new(context.token).call(file.project, "removeObjects", objects: [file.dxid])
    rescue Net::HTTPServerException => e
      raise e unless e.message =~ /^404/
    end

    UserFile.transaction { file.destroy }

    return Rats.failure(message: "#{file.name}: file removal error.") unless file.destroyed?

    Event::FileDeleted.create_for(file, context.user)

    if file.scope =~ /^space-(\d+)$/
      event_type = file.klass == "asset" ? :asset_deleted : :file_deleted
      SpaceEventService.call($1.to_i, context.user_id, nil, file, event_type)
    end
    Rats.success(file)
  end

end

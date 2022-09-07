class CopyService
  class FileCopyError < StandardError; end

  # Copies files to another scope.
  class FileCopier
    class << self
      # Creates db copy of a file with another scope and project.
      # @param file [UserFile] A file to copy.
      # @param scope [String] A destination scope.
      # @param destination_project [String] A destination project.
      # @param attrs [Hash] Extra attributes for a new file.
      # @param skip_parent Attribute introduced because of PFDA-3325.
      #  Set to true if you want to skip setting file as a parent of the new record.
      # @return [UserFile] A new file record.
      # rubocop:disable Style/OptionalBooleanParameter
      def copy_record(file, scope, destination_project, attrs = {}, skip_parent = false)
        existed_file = UserFile.find_by(dxid: file.dxid, project: destination_project)

        return existed_file if existed_file

        file.dup.tap do |new_file|
          new_file.assign_attributes(attrs)
          new_file.scope = scope
          new_file.project = destination_project
          new_file.parent = file unless skip_parent
          new_file.entity_type = UserFile::TYPE_REGULAR
          new_file.archive_entries = file.archive_entries.map(&:dup) if defined? file.archive_entries
          new_file.save!
        end
      end
    end

    def initialize(api:, user:)
      @api = api
      @user = user
    end

    def copy(files, scope, folder_id = nil, skip_parent = false)
      attrs = check_and_assign_folder(scope, folder_id)
      attrs[:user] = user

      @copies = Copies.new

      destination_project = UserFile.publication_project!(user, scope)
      grouped_files = files_grouped_by_project(Array(files).uniq, destination_project)

      grouped_files.each do |project, project_files|
        api.project_clone(project, destination_project, objects: project_files.map(&:dxid))

        project_files.each do |file|
          copied_file = self.class.copy_record(file, scope, destination_project, attrs, skip_parent)
          @copies.push(object: copied_file, source: file)
          Event::FileCopied.create_for(file, copied_file, user)
        end
      end

      @copies
    end
    # rubocop:enable Style/OptionalBooleanParameter

    private

    attr_reader :api, :user

    # Checks if folder belongs to a scope and files can be created in it.
    # @param scope [String] A destination scope.
    # @param folder_id [Integer] A folder ID.
    # @return [Hash] Folder attributes.
    def check_and_assign_folder(scope, folder_id)
      return {} unless folder_id

      folder = Folder.find(folder_id)

      raise FileCopyError, "Folder '#{folder.name}' doesn't belong to a scope '#{scope}'" if folder.scope != scope

      folder_column = Folder.scope_column_name(scope)
      opposite_folder_column = Folder.opposite_scope_column_name(scope)

      { folder_column => folder_id, opposite_folder_column => nil }
    end

    def files_grouped_by_project(files, destination_project)
      files.each_with_object({}) do |file, projects|
        existed_file = UserFile.where.not(state: UserFile::STATE_COPYING).
          find_by(dxid: file.dxid, project: destination_project)

        if existed_file
          @copies.push(
            object: existed_file,
            source: file,
            copied: false,
          )
          next
        end

        next if !file.closed? || destination_project == file.project

        projects[file.project] ||= []
        projects[file.project].push(file)
      end
    end
  end
end

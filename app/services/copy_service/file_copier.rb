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
      # @return [UserFile] A new file record.
      def copy_record(file, scope, destination_project, attrs = {})
        existed_file = UserFile.find_by(dxid: file.dxid, project: destination_project)

        return existed_file if existed_file

        new_file = file.dup
        new_file.assign_attributes(attrs)
        new_file.scope = scope
        new_file.project = destination_project
        new_file.parent = file.asset? ? new_file : file
        new_file.parent_type = "Asset" if file.asset?
        new_file.save!
        new_file
      end
    end

    def initialize(api:, user:)
      @api = api
      @user = user
    end

    def copy(files, scope, folder_id = nil)
      attrs = check_and_assign_folder!(scope, folder_id)
      attrs[:user] = user

      files = Array.wrap(files)
      copies = Copies.new

      destination_project = UserFile.publication_project!(user, scope)

      files_grouped_by_project(copies, files, destination_project).each do |project, project_files|
        api.project_clone(project, destination_project, objects: project_files.map(&:dxid))

        project_files.each do |file|
          copies.push(
            object: self.class.copy_record(file, scope, destination_project, attrs),
            source: file,
          )
        end
      end

      copies
    end

    private

    attr_reader :api, :user

    # Checks if folder belongs to a scope and files can be created in it.
    # @param scope [String] A destination scope.
    # @param folder_id [Integer] A folder ID.
    # @return [Hash] Folder attributes.
    def check_and_assign_folder!(scope, folder_id)
      return {} unless folder_id

      folder = Folder.find(folder_id)

      if folder.scope != scope
        raise FileCopyError, "Folder '#{folder.name}' doesn't belong to a scope '#{scope}'"
      end

      folder_column = Folder.scope_column_name(scope)

      { folder_column => folder_id }
    end

    def files_grouped_by_project(copies, files, destination_project)
      files.uniq.each_with_object({}) do |file, projects|
        existed_file = UserFile.where.not(state: UserFile::STATE_COPYING).
          find_by(dxid: file.dxid, project: destination_project)

        if existed_file.present?
          copies.push(
            object: existed_file,
            source: file,
            copied: false,
          )
          next
        end

        next if file.state != UserFile::STATE_CLOSED || destination_project == file.project

        projects[file.project] ||= []
        projects[file.project].push(file)
      end
    end
  end
end

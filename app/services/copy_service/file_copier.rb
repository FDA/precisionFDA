class CopyService
  class FileCopier

    def initialize(api:, user:)
      @api = api
      @user = user
    end

    def copy(files, scope)
      files = Array.wrap(files)
      new_files = []

      destination_project = UserFile.publication_project!(user, scope)

      files_grouped_by_project(new_files, files, destination_project).each do |project, project_files|
        api.call(project, "clone", objects: project_files.map(&:dxid), project: destination_project)

        project_files.each do |file|
          new_files << copy_record(file, scope, destination_project)
        end
      end

      new_files
    end

    private

    attr_reader :api, :user

    def files_grouped_by_project(new_files, files, destination_project)
      files.uniq.each_with_object({}) do |file, projects|
        existed_file = UserFile.find_by(dxid: file.dxid, project: destination_project)
        if existed_file.present?
          new_files << existed_file
          next
        end

        next unless file.state == UserFile::STATE_CLOSED
        next unless file.passes_consistency_check?(user)
        next if destination_project == file.project

        projects[file.project] = [] unless projects.has_key?(file.project)
        projects[file.project].push(file)
      end
    end

    def copy_record(file, scope, destination_project)
      new_file = file.dup
      new_file.scope = scope
      new_file.project = destination_project
      new_file.scoped_parent_folder_id = nil
      new_file.parent = file
      new_file.save!
      new_file
    end

  end
end

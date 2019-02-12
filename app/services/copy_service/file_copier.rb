class CopyService
  class FileCopier
    def initialize(api:, user:)
      @api = api
      @user = user
    end

    def copy(files, scope)
      files = Array.wrap(files)
      copies = Copies.new

      destination_project = UserFile.publication_project!(user, scope)

      files_grouped_by_project(copies, files, destination_project).each do |project, project_files|
        api.call(project, "clone", objects: project_files.map(&:dxid), project: destination_project)

        project_files.each do |file|
          copies.push(
            object: copy_record(file, scope, destination_project),
            source: file
          )
        end
      end

      copies
    end

    private

    attr_reader :api, :user

    def files_grouped_by_project(copies, files, destination_project)
      files.uniq.each_with_object({}) do |file, projects|
        existed_file = UserFile.find_by(dxid: file.dxid, project: destination_project)
        if existed_file.present?
          copies.push(
            object: existed_file,
            source: file,
            copied: false
          )
          next
        end

        next unless file.state == UserFile::STATE_CLOSED
        next if destination_project == file.project

        projects[file.project] ||= []
        projects[file.project].push(file)
      end
    end

    def copy_record(file, scope, destination_project)
      new_file = file.dup
      new_file.scope = scope
      new_file.project = destination_project
      new_file.scoped_parent_folder_id = nil
      new_file.parent = file.asset? ? new_file : file
      new_file.parent_type = "Asset" if file.asset?
      new_file.save!
      new_file
    end
  end
end

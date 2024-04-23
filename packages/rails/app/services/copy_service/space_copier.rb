class CopyService
  # Copies source space data: apps, workflows and files.
  class SpaceCopier
    def initialize(api:, user:)
      @user = user
      @copy_service = CopyService.new(api: api, user: user)
      @node_copier = NodeCopier.new(api: api, user: user)
    end

    # Copies source space data: apps, workflows and files.
    # @param space [Space] A destination space.
    # @param source_space [Space] A source space.
    def copy(space, source_space)
      ActiveRecord::Base.transaction do
        copy_files_and_folders(space, source_space)
        copy_workflows(space, source_space)
        copy_apps(space, source_space)
      end
    end

    private

    attr_reader :user, :copy_service, :node_copier

    # Copies space's files and folders to a destination space.
    # @param space [Space] A destination space.
    # @param source_space [Space] A source space.
    def copy_files_and_folders(space, source_space)
      nodes = source_space.nodes.where(scoped_parent_folder: nil)
      node_copier.copy(nodes, space.uid)
    end

    # Copies source space workflows to a destination space.
    # @param space [Space] A destination space.
    # @param source_space [Space] A source space.
    def copy_workflows(space, source_space)
      source_space.workflows.each { |workflow| copy_service.copy(workflow, space.uid) }
    end

    # @param space [Space] A destination space.
    # @param source_space [Space] A source space.
    def copy_apps(space, source_space)
      source_space.apps.each { |app| copy_service.copy(app, space.uid) }
    end
  end
end

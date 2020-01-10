class FilePublisher
  def self.by_context(context)
    new(
      api: DNAnexusAPI.new(context.token),
      user: context.user,
    )
  end

  def self.by_challenge_bot
    new(
      api: DNAnexusAPI.new(CHALLENGE_BOT_TOKEN),
      user: User.challenge_bot,
    )
  end

  def initialize(api:, user:)
    @api = api
    @user = user
  end

  def publish(files, scope = "public")
    count = 0
    destination_project = UserFile.publication_project!(user, scope)

    projects = {}

    files.uniq.each do |file|
      next unless file.publishable_by_user?(user, scope)

      unless [UserFile::STATE_CLOSED, UserFile::STATE_PUBLISHING].include?(file.state)
        raise "Unable to publish #{file.name} - file is not closed"
      end

      unless file.passes_consistency_check?(user)
        raise "Consistency check failure for file #{file.id} (#{file.dxid})"
      end

      if destination_project == file.project
        raise "Source and destination collision for file #{file.id} (#{file.dxid})"
      end

      projects[file.project] = [] unless projects.has_key?(file.project)
      projects[file.project].push(file)
    end

    projects.each do |project, project_files|
      api.call(project, "clone", objects: project_files.map(&:dxid), project: destination_project)

      UserFile.transaction do
        project_files.each do |file|
          file.reload

          unless file.publishable_by_user?(user, scope)
            raise "Race condition for file #{file.id} (#{file.dxid})"
          end

          file.update!(
            state: UserFile::STATE_CLOSED,
            scope: scope,
            project: destination_project,
            scoped_parent_folder_id: nil
          )

          count += 1

          if scope =~ /^space-(\d+)$/
            event_type = file.klass == "asset" ? :asset_added : :file_added
            SpaceEventService.call($1.to_i, user.id, nil, file, event_type)
          end
        end
      end

      api.call(project, "removeObjects", objects: project_files.map(&:dxid))
    end

    count
  end

  private

  attr_reader :api, :user
end

class FileCloner
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

  # Publish a file - to make its scope 'public'
  # @param files [Array] - array of UserFile objects to be published.
  # @param scope [String] - a new scope of a file.
  # @param user [User] - a current user, who is going to publish. A current class attribute.
  # @return count [Integer] - files quantity, being published successfully.
  #   returns 0 when no files were published.
  def publish(files, scope = "public")
    count = 0
    destination_project = UserFile.publication_project!(user, scope)
    projects = {}
    files.uniq.each do |file|

      unless [UserFile::STATE_CLOSED, UserFile::STATE_PUBLISHING].include?(file.state)
        raise "Unable to publish #{file.name} - file is not closed"
      end

      if destination_project == file.project
        raise "Source and destination collision for file #{file.id} (#{file.dxid})"
      end

      projects[file.project] = [] unless projects.has_key?(file.project)
      projects[file.project].push(file)
    end

    projects.each do |project, project_files|
      api.project_clone(project, destination_project, { objects: project_files.map(&:dxid)} )
      UserFile.transaction do

        project_files.each do |file|
          file.reload

          raise "Race condition for file #{file.id} (#{file.dxid})" unless file.publishable?(user)

          new_file = file.dup
          new_file.update!(
            state: UserFile::STATE_CLOSED,
            scope: scope,
            project: destination_project,
            scoped_parent_folder_id: nil
          )
          count += 1

          if scope =~ /^space-(\d+)$/
            event_type = new_file.klass == "asset" ? :asset_added : :file_added
            SpaceEventService.call($1.to_i, user.id, nil, new_file, event_type)
          end
        end
      end
    end

    count
  end

  private

  attr_reader :api, :user
end

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
      next unless file.publishable?(user)

      unless [UserFile::STATE_CLOSED, UserFile::STATE_COPYING].include?(file.state) ||
             (file.klass == "folder")
        raise "Unable to publish #{file.name} - file is not closed"
      end

      if destination_project == file.project
        raise "Source and destination collision for file #{file.id} (#{file.dxid})"
      end

      projects[file.project] = [] unless projects.has_key?(file.project)
      projects[file.project].push(file)
    end

    projects.each do |project, project_files|
      if project.present? # clone only files, not folders
        api.project_clone(project, destination_project, { objects: project_files.map(&:dxid) })
      end

      UserFile.transaction do
        project_files.each do |file|
          file.reload

          unless file.publishable?(user)
            raise "Race condition for #{file.klass} #{file.id} (#{file.dxid})"
          end

          file.update!(
              state: UserFile::STATE_CLOSED,
              scope: scope,
              project: destination_project,
              scoped_parent_folder_id: nil
          )
          count += 1

          if scope =~ /^space-(\d+)$/
            event_type =
              if file.klass == "asset"
                :asset_added
              elsif file.klass == "file"
                :file_added
              end
            if event_type.present?
              SpaceEventService.call(Regexp.last_match(1).to_i, user.id, nil, file, event_type)
            end
          end
        end
      end

      api.call(project, "removeObjects", objects: project_files.map(&:dxid)) if project.present?
    end

    count
  end

  private

  attr_reader :api, :user
end

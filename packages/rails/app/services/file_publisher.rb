class FilePublisher
  include Scopes

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

  # Publish a file - creates a copy of the original file with desired scope.
  #   When file is from challenge, its project is taken from describe call, since
  #   Challenge Submission Job is being transferred to space 'scope' and output file has
  #   Challenge Bot privte files project.
  #   Other files, which are non challenge - published in a usual way.
  # @param files [Array] - array of UserFile objects to be published.
  # @param scope [String] - a new scope of a file.
  # @param user [User] - a current user, who is going to publish. A current class attribute.
  # @return count [Integer] - files quantity, being published successfully.
  #   returns 0 when no files were published.
  # rubocop:disable Metrics/MethodLength
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

      projects[file.project] = [] unless projects.key?(file.project)
      projects[file.project].push(file)
    end

    # rubocop:disable Metrics/BlockLength
    projects.each do |project, project_files|
      # clone only files, not folders
      clone_challenge_objects(project_files, destination_project)

      non_challehge_files_dxids =
        project_files.map { |file| file.dxid unless file.challenge_file? }.compact
      if project.present? && !non_challehge_files_dxids.empty?
        api.project_clone(project, destination_project, { objects: non_challehge_files_dxids })
      end

      UserFile.transaction do
        project_files.each do |file|
          file.reload

          unless file.publishable?(user)
            raise "Race condition for #{file.klass} #{file.id} (#{file.dxid})"
          end

          CopyService::FileCopier.copy_record(
            file,
            scope,
            destination_project,
            state: UserFile::STATE_CLOSED,
          )

          count += 1

          if scope =~ /^space-(\d+)$/
            event_type = :file_added if file.klass == "file"
            if event_type.present?
              SpaceEventService.call(Regexp.last_match(1).to_i, user.id, nil, file, event_type)
            end
          end
        end
      end
    end
    # rubocop:enable Metrics/BlockLength

    count
  end

  # Publishes an asset - to make its scope 'public'
  def publish_assets(assets, scope = "public")
    count = 0
    destination_project = UserFile.publication_project!(user, scope)
    projects = {}
    assets.uniq.each do |asset|
      next unless asset.publishable?(user)

      unless [UserFile::STATE_CLOSED, UserFile::STATE_COPYING].include?(asset.state)
        raise "Unable to publish #{asset.name} - file is not closed"
      end

      if destination_project == asset.project
        raise "Source and destination collision for file #{asset.id} (#{asset.dxid})"
      end

      projects[asset.project] = [] unless projects.key?(asset.project)
      projects[asset.project].push(asset)
    end

    # rubocop:disable Metrics/BlockLength
    projects.each do |project, project_assets|
      # clone only files, not folders
      clone_challenge_objects(project_assets, destination_project)

      non_challenge_files_dxids =
        project_assets.map { |file| file.dxid unless file.challenge_file? }.compact
      if project.present? && !non_challenge_files_dxids.empty?
        api.project_clone(project, destination_project, { objects: non_challenge_files_dxids })
      end

      Asset.transaction do
        project_assets.each do |file|
          file.reload

          unless file.publishable?(user)
            raise "Race condition for #{file.klass} #{file.id} (#{file.dxid})"
          end

          file.update!(
            state: UserFile::STATE_CLOSED,
            scope: scope,
            project: destination_project,
            scoped_parent_folder_id: nil,
          )

          count += 1
          
          if scope =~ /^space-(\d+)$/
            event_type = :asset_added if file.klass == "asset"
            if event_type.present?
              SpaceEventService.call(Regexp.last_match(1).to_i, user.id, nil, file, event_type)
            end
          end
        end
      end

      if project.present? && !non_challenge_files_dxids.empty?
        api.call(project, "removeObjects", objects: non_challenge_files_dxids)
      end

    end
    # rubocop:enable Metrics/BlockLength

    count
  end

  # rubocop:enable Metrics/MethodLength

  private

  def clone_challenge_objects(project_files, destination_project)
    project_files.each do |file|
      next unless file.challenge_file?

      result = DNAnexusAPI.new(CHALLENGE_BOT_TOKEN).call(
        "system",
        "describeDataObjects",
        objects: [file.dxid],
      )["results"][0]

      next if result["describe"].blank?

      api.project_clone(
        result["describe"]["project"],
        destination_project,
        { objects: [file.dxid] },
      )
    end
  end

  def copy_service
    @copy_service ||= CopyService.new(api:, user: current_user)
  end

  attr_reader :api, :user
end
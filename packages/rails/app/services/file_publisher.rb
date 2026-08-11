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
    destination_project = UserFile.publication_project!(user, scope)
    files_to_publish = files.uniq.select do |file|
      next unless file.publishable?(user)

      validate_publishable_state!(file)

      if destination_project == file.project
        raise "Source and destination collision for file #{file.id} (#{file.dxid})"
      end

      true
    end

    challenge_files, regular_files = files_to_publish.partition(&:challenge_file?)

    copies = node_api_copier.copy(regular_files, scope) if regular_files.any?
    publish_challenge_files(challenge_files, scope, destination_project) if challenge_files.any?

    # publish_challenge_files raises on any failure, so all challenge files
    # that reach this point were published.
    count_published(regular_files, copies) + challenge_files.size
  end

  # Publishes an asset - to make its scope 'public'.
  #   Behaves like a move: the asset is cloned to the destination project,
  #   the existing record is updated in place, and the origin object is
  #   removed from the source project afterwards.
  def publish_assets(assets, scope = "public")
    destination_project = UserFile.publication_project!(user, scope)
    count = 0

    projects = {}
    assets.uniq.each do |asset|
      next unless asset.publishable?(user)

      unless [UserFile::STATE_CLOSED, UserFile::STATE_COPYING].include?(asset.state)
        raise "Unable to publish #{asset.name} - file is not closed"
      end

      if destination_project == asset.project
        raise "Source and destination collision for file #{asset.id} (#{asset.dxid})"
      end

      (projects[asset.project] ||= []).push(asset)
    end

    projects.each do |project, project_assets|
      clone_challenge_objects(project_assets, destination_project)

      non_challenge_files_dxids = project_assets.reject(&:challenge_file?).map(&:dxid)

      if project.present? && non_challenge_files_dxids.any?
        api.project_clone(project, destination_project, { objects: non_challenge_files_dxids })
      end

      Asset.transaction do
        project_assets.each do |file|
          file.reload

          raise "Race condition for #{file.klass} #{file.id} (#{file.dxid})" unless file.publishable?(user)

          file.update!(
            state: UserFile::STATE_CLOSED,
            scope: scope,
            project: destination_project,
            scoped_parent_folder_id: nil,
          )

          count += 1

          if scope =~ /^space-(\d+)$/ && file.klass == "asset"
            SpaceEventService.call(Regexp.last_match(1).to_i, user.id, nil, file, :asset_added)
          end
        end
      end

      if project.present? && non_challenge_files_dxids.any?
        api.call(project, "removeObjects", objects: non_challenge_files_dxids)
      end
    end

    count
  end

  # rubocop:enable Metrics/MethodLength

  private

  # Regular files are published through the Node API, which skips any
  # non-closed file - admitting the transient "copying" state here would
  # return success while the file is silently dropped, so it is rejected
  # up front with an explicit error. Challenge files keep the legacy
  # force-publish path (direct platform clone + record created as closed),
  # which tolerates the "copying" state.
  def validate_publishable_state!(file)
    return if file.klass == "folder"
    return if file.state == UserFile::STATE_CLOSED
    return if file.challenge_file? && file.state == UserFile::STATE_COPYING

    raise "Unable to publish #{file.name} - file is not closed"
  end

  # Reconciles the number of published regular files against the mapping the
  # Node API actually returned. Files that are not in the mapping were
  # silently skipped by the facade (e.g. a state race - the file was no
  # longer closed by the time the server processed it) and must NOT be
  # reported as published. Nodes reported with copied: false already existed
  # in the destination, which counts as published.
  def count_published(regular_files, copies)
    return 0 if regular_files.blank?

    published_source_ids = (copies&.copies || []).filter_map { |copy| copy.source&.id }
    skipped = regular_files.reject { |file| published_source_ids.include?(file.id) }

    if skipped.any?
      Rails.logger.warn(
        "FilePublisher: Node API skipped #{skipped.size} file(s) during publish: " \
        "#{skipped.map(&:uid).join(', ')} (most likely not in the closed state)",
      )
    end

    regular_files.size - skipped.size
  end

  def clone_challenge_objects(project_files, destination_project)
    project_files.each do |file|
      next unless file.challenge_file?

      source_project = challenge_source_project(file)
      next if source_project.blank?

      api.project_clone(source_project, destination_project, { objects: [file.dxid] })
    end
  end

  def publish_challenge_files(challenge_files, scope, destination_project)
    challenge_files.each do |file|
      file.reload
      raise "Race condition for #{file.klass} #{file.id} (#{file.dxid})" unless file.publishable?(user)

      source_project = challenge_source_project(file)
      raise "Cannot resolve challenge source project for file #{file.id} (#{file.dxid})" if source_project.blank?

      api.project_clone(source_project, destination_project, { objects: [file.dxid] })
      copy_file_record(file, scope, destination_project, state: UserFile::STATE_CLOSED)

      next unless scope =~ /^space-(\d+)$/

      SpaceEventService.call(Regexp.last_match(1).to_i, user.id, nil, file, :file_added)
    end
  end

  def challenge_source_project(file)
    result = DNAnexusAPI.new(CHALLENGE_BOT_TOKEN).call(
      "system",
      "describeDataObjects",
      objects: [file.dxid],
    )["results"]&.first

    result&.dig("describe", "project")
  end

  # rubocop:disable Style/OptionalBooleanParameter
  def copy_file_record(file, scope, destination_project, attrs = {}, skip_parent = false)
    existed_file = UserFile.find_by(dxid: file.dxid, project: destination_project)
    return existed_file if existed_file

    file.dup.tap do |new_file|
      new_file.assign_attributes(attrs)
      new_file.scope = scope
      new_file.project = destination_project
      new_file.parent = file unless skip_parent
      new_file.archive_entries = file.archive_entries.map(&:dup) if defined? file.archive_entries
      new_file.locked = false
      new_file.save!
    end
  end
  # rubocop:enable Style/OptionalBooleanParameter

  def node_api_copier
    @node_api_copier ||= CopyService::NodeApiCopier.new(api:, user:)
  end

  attr_reader :api, :user
end

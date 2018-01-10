class FilePublisher

  def self.by_context(context)
    new(
      api: DNAnexusAPI.new(context.token),
      user: context.user
    )
  end

  def self.by_challenge_bot
    new(
      api: DNAnexusAPI.new(CHALLENGE_BOT_TOKEN),
      user: User.challenge_bot
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
      raise "Unable to publish #{file.name} - file is not closed" unless file.state == UserFile::STATE_CLOSED
      raise "Consistency check failure for file #{file.id} (#{file.dxid})" unless file.passes_consistency_check?(user)
      raise "Source and destination collision for file #{file.id} (#{file.dxid})" if destination_project == file.project
      projects[file.project] = [] unless projects.has_key?(file.project)
      projects[file.project].push(file)
    end

    projects.each do |project, project_files|
      api.call(project, "clone", objects: project_files.map(&:dxid), project: destination_project)

      UserFile.transaction do
        project_files.each do |file|
          file.reload
          raise "Race condition for file #{file.id} (#{file.dxid})" unless file.publishable_by_user?(user, scope)
          file.update!(scope: scope, project: destination_project, scoped_parent_folder_id: nil)
          count += 1
        end
      end

      api.call(project, "removeObjects", objects: project_files.map(&:dxid))
    end

    count
  end

  private

  attr_reader :api, :user

end

# Copies files to a scope in the background.
class FileCopyWorker < ApplicationWorker
  sidekiq_retries_exhausted do |job, _ex|
    remove_failed_files(job)
    notify_user(job)
  end

  class << self
    # Rollbacks files to "closed" state and returns "private" scope.
    # @param job [Sidekiq::Job] Current job.
    def remove_failed_files(job)
      context = build_context(job)
      api = context.api
      scope = job["args"].first
      project = UserFile.publication_project!(context.user, scope)

      files = UserFile.where(scope: scope, project: project, state: UserFile::STATE_COPYING)

      begin
        api.project_remove_objects(project, files.map(&:dxid))
      rescue DXClient::Errors::NotFoundError
        # do nothing
      end

      files.destroy_all
    end

    # Builds user context.
    # @param job [Sidekiq::Job] Current job.
    # @return [Context] A user context.
    def build_context(job)
      Context.build(job["args"].last)
    end
  end

  # Copies files.
  #
  # @param scope [String] A destination scope (private, space-xx).
  # @param file_ids [Array<Integer>] File IDs to copy.
  # @param session_auth_params [Hash] User session auth params.
  #
  # @return [Copies] Object that includes all copied files.
  def perform(scope, file_ids, folder_id, session_auth_params)
    @context = Context.build(session_auth_params)
    RequestContext.begin_request(@context.user_id, @context.username, @context.token)
    @scope = scope

    files = UserFile.where(id: file_ids)
    copies = copy_service.copy(files, @scope, folder_id)

    # only new copies with properties - it has to be done here and not in copy service, because of non commited transaction.
    # after the copy method the files are commited and reachable in node backend.
    new_only = copies.select { |copy| copy.copied && copy.source.properties.present? }
    new_only.each do |new|
      property_hash = {}
      new.source.properties.each do |property|
        property_hash[property.property_name] = property.property_value
      end
      https_apps_client.set_properties(new.object.id, "node", property_hash)
    end

    # replace COPYING state by a source file state.
    copies.each { |object, source, _| object.update!(state: source.state) }

    message = if copies.all?(&:copied)
      "File#{files.length == 1 ? ' was' : 's were'} successfully copied to the space"
    elsif copies.any?(&:copied)
      "Some files were successfully copied to the space, while some already exist there"
    else
      "No files were copied - all already exist in the space"
    end

    notification = {
      action: "NODES_COPIED",
      message:,
      severity: "INFO",
      userId: @context.user_id,
    }

    https_apps_client.send_notification(notification)
  rescue => e
    logger.error "An error occurred: #{e.message}"
    logger.error e.backtrace.join("\n")
    raise
  ensure
    RequestContext.end_request
  end

  private

  def copy_service
    @copy_service ||= CopyService::FileCopier.new(api: @context.api, user: @context.user)
  end

  def https_apps_client
    HttpsAppsClient.new
  end
end

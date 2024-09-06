# Copies files and folders to private scope or space in the background.
class NodeCopyWorker < ApplicationWorker
  sidekiq_retries_exhausted do |job, _ex|
    notify_user(job)
    rollback_platform_files(job)
  end

  class << self
    # Removes files from the new project where they were copied to.
    # @param job [Sidekiq::Job] Current job.
    def rollback_platform_files(job)
      context = build_context(job)
      scope = job["args"].first
      nodes_ids = job["args"].second
      project = UserFile.publication_project!(context.user, scope)
      nodes_dxids = UserFile.where(id: nodes_ids).pluck(:dxid)
      persisted_dxids =
        UserFile.where(dxid: nodes_dxids, scope: scope, project: project).pluck(:dxid)

      (nodes_dxids - persisted_dxids).each_slice(1000) do |dxids|
        context.api.project_remove_objects(project, dxids, force: true)
      end
    end

    # Builds user context.
    # @param job [Sidekiq::Job] Current job.
    # @return [Context] A user context.
    def build_context(job)
      Context.build(job["args"].last)
    end
  end

  # Copies files and folders.
  #
  # @param scope [String] A destination scope (private, space-xxx).
  # @param nodes_ids [Array<Integer>] Files or folders IDs to copy.
  # @param session_auth_params [Hash] User session auth params.
  def perform(scope, nodes_ids, folder_id, session_auth_params)
    @context = Context.build(session_auth_params)
    RequestContext.begin_request(@context.user_id, @context.username, @context.token)

    nodes = Node.where(id: nodes_ids)
    copies = copy_service.copy(nodes, scope, folder_id)

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

    message = if copies.all?(&:copied)
      "File#{nodes.length == 1 ? ' was' : 's were'} successfully copied to the space"
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
    notify_user(copies, scope)
  rescue => e
    logger.error "An error occurred: #{e.message}"
    logger.error e.backtrace.join("\n")
    raise
  ensure
    RequestContext.end_request
  end

  private

  # Notifies users if some items weren't copied.
  # @param copies [CopyService::Copies] The collection of copied files and sources.
  # @param scope [String] The destination scope.
  def notify_user(copies, scope)
    return if copies.all?(&:copied)

    copy_ids = copies.instance_variable_get(:@copies).map { |copy| copy.object.id }
    WorkerMailer.node_copy_email(
      @context.user.email,
      copy_ids,
      scope,
    ).deliver_later
  end

  def copy_service
    @copy_service ||= CopyService::NodeCopier.new(api: @context.api, user: @context.user)
  end
end

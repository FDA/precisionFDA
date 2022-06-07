# Copies files and folders to private scope or space in the background.
class NodeCopyWorker < ApplicationWorker
  sidekiq_retries_exhausted do |job, _ex|
    notify_user(job)
    rollback_platform_files(job)
  end

  class << self
    # Notifies user if there was any error with copying.
    # @param job [Sidekiq::Job] A sidekiq job.
    def notify_user(job)
      scope = job["args"].first
      context = build_context(job)

      subject = "An error occurred during the copying to scope '#{scope}'"
      message = "#{subject}: #{job['error_message']}"

      Rails.logger.error(message)

      WorkerMailer.alert_email(context.user.email, message, subject).deliver_now
    end

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
  def perform(scope, nodes_ids, session_auth_params)
    @context = Context.build(session_auth_params)
    nodes = Node.where(id: nodes_ids)
    copies = copy_service.copy(nodes, scope)
    notify_user(copies, scope)
  end

  private

  # Notifies users if some items weren't copied.
  # @param copies [CopyService::Copies] The collection of copied files and sources.
  # @param scope [String] The destination scope.
  def notify_user(copies, scope)
    return if copies.all?(&:copied)

    WorkerMailer.node_copy_email(
      @context.user.email,
      copies,
      scope,
    ).deliver_now
  end

  def copy_service
    @copy_service ||= CopyService::NodeCopier.new(api: @context.api, user: @context.user)
  end
end

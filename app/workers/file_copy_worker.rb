# Copies files to a scope in the background.
class FileCopyWorker < ApplicationWorker
  sidekiq_retries_exhausted do |job, _ex|
    remove_failed_files(job)
    notify_user(job)
  end

  class << self
    # Notifies a user if there was any error with copying.
    # @param job [Sidekiq::Job] Current job.
    def notify_user(job)
      scope = job["args"].first

      context = build_context(job)

      subject = "An error occurred during the copying to scope '#{scope}'"
      message = "#{subject}: #{job['error_message']}"

      Rails.logger.error(message)

      WorkerMailer.alert_email(context.user.email, message, subject).deliver_now
    end

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
    @scope = scope

    files = UserFile.where(id: file_ids)

    copies = copy_service.copy(files, @scope, folder_id)

    # replace COPYING state by a source file state.
    copies.each { |object, source, _| object.update!(state: source.state) }
  end

  private

  def copy_service
    @copy_service ||= CopyService::FileCopier.new(api: @context.api, user: @context.user)
  end
end

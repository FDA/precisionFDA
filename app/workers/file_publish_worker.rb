# Publishes items.
class FilePublishWorker < ApplicationWorker
  class PublishError < StandardError; end

  sidekiq_retries_exhausted do |job, _ex|
    files = UserFile.where(id: job["args"].second)

    rollback_file_states(files)
    notify_user(job)
  end

  class << self
    # Notifies a user if there was any error with publishing.
    # @param job [Sidekiq::Job] Current job.
    def notify_user(job)
      scope = job["args"].first

      context = Context.build(job["args"].last)

      subject = "An error occurred during the publishing in scope '#{scope}'"
      message = "#{subject}: #{job['error_message']}"

      Rails.logger.error(message)

      WorkerMailer.alert_email(context.user.email, message, subject).deliver_now
    end

    # Rollbacks files to "closed" state and returns "private" scope.
    # @param files [UserFile::ActiveRecord_Relation] Files to update.
    # @return [Array<UserFile>] Updated files.
    def rollback_file_states(files)
      files.update(state: UserFile::STATE_CLOSED, scope: "private")
    end
  end

  # Publishes files.
  # @param scope [String] File scope (public, private, space-xx).
  # @param file_ids [Array<String>] File IDs to publish.
  # @param session_auth_params [Hash] User session auth params.
  # @return [Integer] Number of published files.
  def perform(scope, file_ids, session_auth_params)
    @context = Context.build(session_auth_params)
    @scope = scope || "public"
    @files = UserFile.where(id: file_ids).where.not(scope: "public")

    publish
  end

  private

  # Publishes files.
  # @return [Integer] Number of published files.
  def publish
    check_files!

    UserFile.publish(@files, @context, @scope)
  end

  # Checks if files are publishable by a user.
  # @raise [FilePublishWorker::PublishError] If any file isn't publishable by a user.
  def check_files!
    return if @files.present? && @files.all? { |file| file.publishable_by?(@context, @scope) }

    raise PublishError, "Unpublishable items detected"
  end
end

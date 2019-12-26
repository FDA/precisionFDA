# Publishes items.
class FilePublishWorker < ApplicationWorker
  class PublishError < StandardError; end

  sidekiq_retries_exhausted { |job, _ex| notify_user(job) }

  class << self
    def notify_user(job)
      scope = job["args"].first
      file_ids = job["args"].second
      context = Context.build(job["args"].last)

      rollback_file_states(file_ids)

      subject = "An error occurred during the publishing in scope '#{scope}'"
      message = "#{subject}: #{job['error_message']}"

      Rails.logger.error(message)

      WorkerMailer.alert_email(context.user.email, message, subject).deliver_now
    end

    def rollback_file_states(file_ids)
      files = UserFile.where(id: file_ids, state: UserFile::STATE_PUBLISHING)
      files.update(state: UserFile::STATE_CLOSED)
    end
  end

  # Publishes items.
  # @param scope [String] File scope (public, private, space-xx).
  # @param file_ids [Array<String>] File IDs to publish.
  # @param session_auth_params [Hash] User session auth params.
  # @return [Integer] Number of published files.
  def perform(scope, file_ids, session_auth_params)
    @context = Context.build(session_auth_params)
    @scope = scope || "public"
    @files = UserFile.where(id: file_ids).
                      where.not(scope: ["public", @scope].uniq)

    publish
  end

  private

  # Publishes files.
  # @return [Integer] Number of published files.
  def publish
    check_files!

    UserFile.publish(@files, @context, @scope)
  end

  # Checks if items are publishable by a user.
  # @raise [FilePublishWorker::PublishError] If any item isn't publishable by a user.
  def check_files!
    return if @files.present? && @files.all? { |item| item.publishable_by?(@context, @scope) }

    raise PublishError, "Unpublishable items detected"
  end
end

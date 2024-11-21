# Base sidekiq worker
class ApplicationWorker
  include Sidekiq::Worker

  sidekiq_options retry: 1, backtrace: 5

  # Notifies a user if there was any error with copying.
  # @param job [Sidekiq::Job] Current job.
  def self.notify_user(job)
    scope = job["args"].first

    context = build_context(job)
    forward_header = job["args"].last

    subject = "An error occurred during the copying to scope '#{scope}'"
    message = "#{subject}: #{job['error_message']}"

    notification = {
      action: "NODES_COPIED",
      message:,
      severity: "ERROR",
      userId: context.user_id,
    }
    RequestContext.begin_request(context.user_id, context.username, context.token, forward_header)
    https_apps_client.send_notification(notification)

    Rails.logger.error(message)

    https_apps_client.email_send(NotificationPreference.email_types[:alert_message], [context.user.id], { subject:, message: })
    RequestContext.end_request
  end

  def https_apps_client
    HttpsAppsClient.new
  end
end

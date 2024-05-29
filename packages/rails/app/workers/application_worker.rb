# Base sidekiq worker
class ApplicationWorker
  include Sidekiq::Worker

  sidekiq_options retry: 1, backtrace: 5

  # Notifies a user if there was any error with copying.
  # @param job [Sidekiq::Job] Current job.
  def self.notify_user(job)
    scope = job["args"].first

    context = build_context(job)

    subject = "An error occurred during the copying to scope '#{scope}'"
    message = "#{subject}: #{job['error_message']}"

    notification = {
      action: "NODES_COPIED",
      message:,
      severity: "ERROR",
      userId: context.user_id,
    }
    h_a_client = HttpsAppsClient.new
    RequestContext.begin_request(context.user_id, context.username, context.token)
    h_a_client.send_notification(notification)
    RequestContext.end_request

    Rails.logger.error(message)

    WorkerMailer.alert_email(context.user.email, message, subject).deliver_now
  end

  def https_apps_client
    HttpsAppsClient.new
  end
end

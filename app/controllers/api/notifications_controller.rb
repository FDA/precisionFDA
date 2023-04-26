module Api
  # temporary controller for forwarding the calls
  class NotificationsController < ApiController
    def update
      id = params[:id]

      delivered_at = params[:deliveredAt]
      https_apps_client.update_notification(id, delivered_at)
    end
  end
end

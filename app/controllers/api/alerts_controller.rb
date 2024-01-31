module Api
  # Alerts API controller.
  class AlertsController < ApiController
    include Paginationable
    before_action :require_login

    def create
      response = https_apps_client.create_alert(alert_params)
      render json: response
    end

    def update
      response = https_apps_client.update_alert(params[:id], alert_params)
      render json: response
    end

    def destroy
      response = https_apps_client.delete_alert(params[:id])
      render json: response
    end

    def index
      response = https_apps_client.get_all_alerts(params[:active])
      render json: response
    end

    def alert_params
      params.require(:alert).permit(:title, :content, :type, :startTime, :endTime)
    end
  end
end

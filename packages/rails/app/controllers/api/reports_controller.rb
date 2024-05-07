module Api
  # Reports API controller
  class ReportsController < ApiController
    before_action :require_login

    # POST /api/reports
    def create
      response = https_apps_client.create_space_report(params[:scope], params[:format], params[:options])
      render json: response, adapter: :json
    rescue Net::HTTPClientException => e
      render status: e.response.code, json: e.response.body
    end

    # GET /api/reports
    def list
      response = https_apps_client.get_space_reports(params[:scope])

      if response.blank?
        render(plain: "[]", content_type: "application/json")
      else
        render json: response, root: true, adapter: :json
      end
    end

    # DELETE /api/reports
    def delete
      ids = Rack::Utils.parse_query(request.query_string).fetch("id", [])
      response = https_apps_client.delete_space_reports(ids)

      if response.blank?
        render(plain: "[]", content_type: "application/json")
      else
        render json: response, adapter: :json
      end
    end
  end
end

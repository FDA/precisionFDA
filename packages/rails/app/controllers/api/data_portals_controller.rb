module Api
  # Data Portals API controller
  class DataPortalsController < ApiController
    before_action :require_login

    wrap_parameters false

    def create
      space = provision_space

      data_portal = {
        name: data_portal_params[:name],
        description: data_portal_params[:description],
        urlSlug: data_portal_params[:url_slug],
        cardImageFileName: data_portal_params[:card_image_file_name],
        status: data_portal_params[:status],
        spaceId: space.id,
        sortOrder: data_portal_params[:sort_order].to_i,
        hostLeadDxUser: data_portal_params[:host_lead_dxuser],
        guestLeadDxUser: data_portal_params[:guest_lead_dxuser],
      }
      portal = https_apps_client.data_portal_save(data_portal)

      render json: portal,
             adapter: :json
    rescue Net::HTTPClientException => e
      render status: e.response.code, json: e.response.body
    end

    def index
      data_portals = https_apps_client.data_portals_list
      render json: data_portals
    rescue Net::HTTPClientException => e
      render status: e.response.code, json: e.response.body
    end

    def show
      portal = https_apps_client.data_portals_get(params[:id])

      render json: portal,
             adapter: :json
    rescue Net::HTTPClientException => e
      render status: e.response.code, json: e.response.body
    end

    def list_resources
      response = https_apps_client.data_portal_list_resources(params[:id])
      converted_resources = []
      response.each do |resource|
        converted_resources << convert_json_keys_to_snake_case(resource)
      end

      render json: converted_resources
    rescue Net::HTTPClientException => e
      render status: e.response.code, json: e.response.body
    end

    def create_resource
      # We don't want the data portal ID (or slug) param. It's just confusing
      resource_params = file_params
      resource_params.delete(:id)
      resource = https_apps_client.data_portal_create_resource(params[:id], resource_params)
      render json: resource,
             adapter: :json
    rescue Net::HTTPClientException => e
      render status: e.response.code, json: e.response.body
    end

    def remove_resource
      resource = https_apps_client.data_portal_remove_resource(params[:data_portal_id], params[:resource_id])
      render json: resource,
             adapter: :json
    rescue Net::HTTPClientException => e
      render status: e.response.code, json: e.response.body
    end

    def card_image
      file_dxid = https_apps_client.data_portal_card_image_create(params[:id], file_params)
      render json: file_dxid,
             adapter: :json
    rescue Net::HTTPClientException => e
      render status: e.response.code, json: e.response.body
    end

    def update
      portal_data = {
        id: data_portal_params[:id].to_i,
      }
      portal_data[:name] = data_portal_params[:name] unless data_portal_params[:name].nil?
      portal_data[:description] = data_portal_params[:description] unless data_portal_params[:description].nil?
      portal_data[:status] = data_portal_params[:status] unless data_portal_params[:status].nil?
      portal_data[:cardImageUid] = data_portal_params[:card_image_uid] unless data_portal_params[:card_image_uid].nil?
      portal_data[:sortOrder] = data_portal_params[:sort_order].to_i unless data_portal_params[:sort_order].nil?
      portal_data[:hostLeadDxUser] = data_portal_params[:host_lead_dxuser] unless data_portal_params[:host_lead_dxuser].nil?
      portal_data[:guestLeadDxUser] = data_portal_params[:guest_lead_dxuser] unless data_portal_params[:guest_lead_dxuser].nil?
      portal_data[:content] = data_portal_params[:content] unless data_portal_params[:content].nil?
      portal_data[:editorState] = data_portal_params[:editor_state] unless data_portal_params[:editor_state].nil?

      portal = https_apps_client.data_portal_update(portal_data)
      render json: portal,
             adapter: :json
    rescue Net::HTTPClientException => e
      render status: e.response.code, json: e.response.body
    end

    private

    def convert_json_keys_to_snake_case(json)
      snake_case_json = json.deep_transform_keys { |key| key.to_s.underscore }
      JSON.parse(snake_case_json.to_json)
    end

    def file_params
      params.
        permit(
          :id,
          :name,
          :description,
        )
    end

    def data_portal_params
      params.
        permit(
          :id,
          :name,
          :description,
          :url_slug,
          :card_image_file_name,
          :status,
          :card_image_uid,
          :host_lead_dxuser,
          :guest_lead_dxuser,
          :sort_order,
          :content,
          :editor_state,
        )
    end

    def provision_space
      space_form = SpaceForm.new(
        name: data_portal_params[:name],
        description: data_portal_params[:description],
        host_lead_dxuser: data_portal_params[:host_lead_dxuser],
        guest_lead_dxuser: data_portal_params[:guest_lead_dxuser],
        space_type: SpaceForm::TYPE_GROUPS,
      )

      SpaceService::Create.call(
        space_form,
        api: @context.api,
        user: @context.user,
        for_challenge: false,
      )
    end
  end
end

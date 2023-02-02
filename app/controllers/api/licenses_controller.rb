module Api
  # Home API controller for Licenses.
  # rubocop:disable Metrics/ClassLength
  class LicensesController < ApiController
    # GET - Returns user accessible list_licenses according to input filters.
    #   Used in license dialogs.
    # @param scopes [Array], optional - array of valid scopes on the licenses,
    #   e.g. ["private", "public", "space-1234"] or leave blank for all
    # @return licenses [License] An array of hashes - License object, with its connected data.
    def index
      check_scope!
      licenses = License.
        editable_by(@context).
        eager_load(user: :org).
        includes(:taggings).
        order(:title)
      licenses = licenses.where(scope: params[:scopes]) if params[:scopes].present?

      render json: licenses, root: "licenses", adapter: :json
    end

    # GET /api/licenses/:id
    # A fetch method for licenses by file :id, editable by a current user.
    # @param id [Integer] Param for license fetch.
    # @return @license [] License object
    def show
      find_license

      if @license
        items_count = @license.licensed_items.size || 0
        users_count = @license.licensed_users.size || 0
      end

      render json:
               @license, root: "licenses", adapter: :json,
             meta: {
               items_count: items_count,
               users_count: users_count,
             }
    end

    # POST license_item_api_license /license_item/:item_uid
    # Change license of UserFile and Asset objects
    # @param id [Integer]
    # @param item_uid [Integer] items to license id
    def license_item
      license = License.find(params[:id])
      item = item_from_uid(params[:item_uid])
      path = pathify(item)

      if license.editable_by?(@context) && item.editable_by?(@context)
        LicensedItem.transaction do
          licensed_item = LicensedItem.find_by(licenseable: item)
          licensed_item&.destroy

          if LicensedItem.create!(license_id: license.id, licenseable: item)
            type = :success
            text = "This #{item.dxid.partition('-').first} now requires the license:" \
                   " #{license.title}"
          else
            type = :error
            text = "Sorry, this license does not exist or is not accessible by you"
          end

          render json: { path: path, message: { type: type, text: text } }, adapter: :json
          return
        end
      end
      type = :warning
      text = "Sorry, You have no permission to change license for" \
             " \"#{item.dxid.partition('-').first}\""

      render json: { path: path, message: { type: type, text: text } }, adapter: :json
    end

    # Get single license by its :id. A license is editable_by a current_user
    # If no license is found - an error exeption message is provided
    def find_license
      licenses = License.editable_by(@context)
      permitted_ids = licenses.pluck(:id)
      @license = licenses.find(params[:id]) if permitted_ids.include?(params[:id].to_i)

      raise ApiError, I18n.t("license_not_accessible") if @license.nil?

      @license
    end

    # POST remove_item_api_license
    # detach license from an object
    # @param id [Integer] - license :id
    # @param item_uid [Integer] - object :uid
    def remove_item
      license = License.find(params[:id])
      item = item_from_uid(params[:item_uid])
      if license.editable_by?(@context)
        LicensedItem.transaction do
          licensed_item = license.licensed_items.find_by(licenseable: item)
          if licensed_item.nil?
            type = :error
            text = "Cannot detach this License \"#{license.title}\" from the item"
            path = items_license_path(license)
          else
            licensed_item.destroy
            type = :success
            text = "License \"#{license.title}\" has been successfully detached from the item"
            path = pathify(item)
          end

          render json: { path: path, message: { type: type, text: text } }, adapter: :json
          return
        end
      else
        type = :warning
        text = "You have no permission to detach this License \"#{license.title}\""
        path = pathify(item_from_uid(item))

        render json: { path: path, message: { type: type, text: text } }, adapter: :json
      end
    end

    # POST "/licenses/6-license-title/request_approval" - send a request to approve a license
    # @param accepted_license [Object] - { "message" => "Approve 4444" },
    # @param id [Integer] - license :id - "6-license-title".
    # GET "/licenses/6-license-title/request_approval" - return a license approval
    # rubocop:disable Metrics/MethodLength
    def request_approval
      accessible_license
      path = api_license_path(license&.id)

      if @license.nil?
        type = :warning
        text = "Sorry, this license does not exist or is not accessible by you"

        render json: { path: path, message: { type: type, text: text } }, adapter: :json
        return
      end
      message = !params[:accepted_license].nil? ? params[:accepted_license][:message] : nil

      if request.post? && !message.nil? && message.is_a?(String)
        accepted_license = AcceptedLicense.create!({
          license_id: @license.id,
          user_id: @context.user_id,
          state: "pending",
          message: message,
        })
        if accepted_license.persisted?
          NotificationsMailer.license_request_email(license, @context.user, message).deliver_now!
          type = :success
          text = "License \"#{@license.title}\" approval requested"
        else
          type = :warning
          text = "You cannot approve this License \"#{@license.title}\", since its acceptance" \
            " does not exist"
        end

        render json:
               accepted_license, root: "accepted_licens", adapter: :json,
               path: path, message: { type: type, text: text }
      else
        accepted_license = AcceptedLicense.new({
          license_id: @license.id,
          user_id: @context.user_id,
          state: "pending",
          message: message,
        })
        text = "License acception was created"

        render json:
                 accepted_license, root: "accepted_licens", adapter: :json,
               path: license_path(@license), message: { type: :success, text: text }
      end
    end
    # rubocop:enable Metrics/MethodLength

    #
    # POST accept_api_license /api/licenses/:id/accept
    # Called from license#show, file#show, asset#show
    # Accept a single license for file/asset
    # @param id [Integer] - license :id - "6-license-title".
    def accept
      accessible_license

      if AcceptedLicense.find_or_create_by(license_id: @license.id, user_id: @context.user_id)
        type = :success
        text = "License \"#{@license.title}\" accepted"
      else
        type = :error
        text = "Sorry, license \"#{@license.title}\" does not exist or is not accessible by you"
      end

      render json: { message: { type: type, text: text } }, adapter: :json
    end

    # Returns all licenses accepted by current user
    #
    # Outputs
    # list of accepted license objects
    def accepted_licenses
      result = https_apps_client.accepted_licenses
      render json: result
    end

    private

    def accessible_license
      @license = License.accessible_by(@context).find(params[:id])
    end
  end
end
# rubocop:enable Metrics/ClassLength

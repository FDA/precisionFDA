# Asset serializer.
class AssetSerializer < UserFileSerializer
  attributes(
    :uid,
    :created_at_date_time,
    :added_by,
    :archive_content,
    :links,
    :file_license,
  )
  attribute :properties_object, key: :properties

  # get array of asset archive_entries
  def archive_content
    object.file_paths
  end

  def properties_object
    props = {}
    object.properties.each do |prop|
      props[prop.property_name] = prop.property_value
    end
    props
  end

  # Builds links to files.
  # @return [Hash] Links.
  # rubocop:disable Metrics/MethodLength
  def links
    return {} unless current_user

    # rubocop:disable Metrics/BlockLength
    super.tap do |links|
      links[:show] = api_asset_path(object)
      links[:user] = user_path(object.user.dxuser)
      links[:space] = space_path if object.in_space?

      # POST download_list asset
      links[:download_list] = download_list_api_files_path
      # POST /api/files/copy  copy_api_files
      links[:copy] = copy_api_files_path

      if object.license.present? && object.license_status?(current_user, "active")
        unless object.license.owned_by_user?(current_user)
          # GET download single asset
          links[:download] = download_api_file_path(object)
        end
      end

      if object.license.blank? && object.owned_by_user?(current_user)
        # GET download single asset
        links[:download] = download_api_file_path(object)
      end

      if object.license.present? && !object.license_status?(current_user, "active")
        if object.license.approval_required
          unless object.license_status?(current_user, "pending")
            # GET|POST /licenses/:id/request_approval
            links[:request_approval_license] =
              request_approval_license_path(object.license.id)
            links[:request_approval_action] = "api/licenses/:id/request_approval"
          end
        else
          # POST /api/licenses/:id/accept
          links[:accept_license_action] =
            object.license && accept_api_license_path(object.license.id)
        end
      end

      # GET asset license page if exists
      links[:show_license] = license_path(object.license.id) if object.license

      if object.owned_by_user?(current_user)
        unless object.in_space? && member_viewer?
          # publish single asset if it is not public already
          links[:publish] = publish_object unless object.public?
          # POST: /api/assets/rename
          links[:rename] = rename_api_assets_path(object)
          # DELETE: /api/assets/:id - Delete single asset
          links[:remove] = api_asset_path(object)
          # POST associate item to a license
          links[:license] = "/api/licenses/:id/license_item/:item_uid" if licenseable
          if object.license&.owned_by_user?(current_user)
            # GET asset license object if exists
            links[:object_license] = api_license_path(object.license&.id)
            # POST detach license from item
            links[:detach_license] = "/api/licenses/:id/remove_item/:item_uid"
          end
          # PUT /api/assets/:id update single asset: title and description permitted
          links[:update] = api_asset_path(object)
        end
      end
      # POST /api/attach_to: api_attach_to_notes, discussions, answers
      links[:attach_to] = api_attach_to_notes_path

      if current_user.can_administer_site?
        # PUT /api/assets/feature #
        links[:feature] = feature_api_assets_path
      end
      # rubocop:enable Metrics/BlockLength
    end
  end
  # rubocop:enable Metrics/MethodLength
end

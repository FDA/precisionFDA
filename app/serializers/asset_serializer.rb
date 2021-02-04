# Asset serializer.
class AssetSerializer < UserFileSerializer
  include ActionView::Helpers::NumberHelper
  include FilesHelper

  attributes(
    :uid,
    :created_at_date_time,
    :added_by,
    :archive_content,
    :links,
    :file_license,
  )

  attribute :all_tags_list, key: :tags

  # get array of asset archive_entries
  def archive_content
    object.file_paths
  end

  # Builds links to files.
  # @return [Hash] Links.
  def links
    return {} unless current_user

    {}.tap do |links|
      links[:show] = api_asset_path(object)
      links[:user] = user_path(object.user.dxuser)
      links[:space] = space_path if object.in_space?

      # GET download single file #
      links[:download] = download_api_file_path(object)
      # POST download_list files #
      links[:download_list] = download_list_api_files_path
      # POST Authorize URL - to move to api #
      links[:link] = link_file_path(object)

      # GET asset license page if exists
      links[:show_license] = license_path(object.license.id) if object.license

      if object.owned_by_user?(current_user)
        # POST: /api/assets/rename
        links[:rename] = rename_api_assets_path(object)
        # publish single asset if it is not public already
        links[:publish] = publish_object unless object.public?
        # PUT /api/assets/:id update single asset: title and description permitted
        links[:update] = api_asset_path(object)
        # DELETE: /api/assets/:id - Delete single asset
        links[:remove] = api_asset_path(object)
        if object.license
          # GET asset license object if exists
          links[:object_license] = api_license_path(object.license&.id)
          # POST detach license from item
          links[:detach_license] = "/api/licenses/:id/remove_item/:item_uid"
        end
        # POST associate item to a license
        links[:license] = "/api/licenses/:id/license_item/:item_uid" if licenseable
        # POST /api/attach_to: api_attach_to_notes, discussions, answers
        links[:attach_to] = api_attach_to_notes_path
        # POST /api/files/copy copy_api_files
        links[:copy] = copy_api_files_path
      end

      if current_user.can_administer_site?
        # PUT /api/assets/feature #
        links[:feature] = feature_api_assets_path
      end
    end
  end

  delegate :all_tags_list, to: :object
end

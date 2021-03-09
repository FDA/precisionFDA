# UserFile serializer.
class UserFileSerializer < NodeSerializer
  include ActionView::Helpers::NumberHelper
  include FilesHelper

  attributes(
    :uid,
    :file_size,
    :created_at,
    :created_at_date_time,
    :description,
    :origin,
    :location,
    :links,
    :file_license,
  )

  attribute :all_tags_list, key: :tags

  def file_size
    number_to_human_size(object.file_size)
  end

  # Returns a file's origin: one of Executable, Uploaded or Job origin data.
  # @return [String] origin name.
  def origin
    return unless current_user

    node_origin(object)
  end

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end

  # Builds links to files.
  # @return [Hash] Links.
  # rubocop:disable Metrics/MethodLength
  def links
    return {} unless current_user

    # rubocop:disable Metrics/BlockLength
    {}.tap do |links|
      links[:show] = file_path(object)
      links[:user] = user_path(object.user.dxuser)
      links[:space] = space_path if object.in_space?
      # track single object
      links[:track] = track_object

      # GET download single file
      links[:download] = download_api_file_path(object)
      # POST download_list files
      links[:download_list] = download_list_api_files_path
      # POST Authorize URL - to move to api
      links[:link] = link_file_path(object)

      # publish single file if it is not public already
      links[:publish] = publish_object unless object.public?
      # POST /api/files/copy  copy_api_files
      links[:copy] = copy_api_files_path

      # POST: Add file
      links[:add_file] = api_create_file_path
      # POST: Add folder
      links[:add_folder] = create_folder_api_files_path

      # GET: File origin object data { type, uid }
      links[:origin_object] = origin_object

      # link to license page if exists
      links[:show_license] = license_path(object.license.id) if object.license

      if object.owned_by_user?(current_user)
        unless object.in_space? && member_viewer?
          links[:rename] = rename_file_path(object)
          # POST: /api/files/remove - Delete file(s) & folder(s), being selected
          links[:remove] = remove_api_files_path
          # POST associate item to a license
          links[:license] = "/api/licenses/:id/license_item/:item_uid" if licenseable
          if object.license
            # GET UserFile license object if exists
            links[:object_license] = api_license_path(object.license&.id)
            # POST detach license from item
            links[:detach_license] = "/api/licenses/:id/remove_item/:item_uid"
          end
          # POST: Move file(s) and folder()s) to other folder
          links[:organize] = move_api_files_path
        end
        # PUT edit a single file
        links[:update] = api_files_path(object)

        # POST /api/attach_to: api_attach_to_notes, discussions, answers
        links[:attach_to] = api_attach_to_notes_path
      end

      if current_user.can_administer_site?
        # PUT /api/files/feature
        links[:feature] = feature_api_files_path
      end
    end
    # rubocop:enable Metrics/BlockLength
  end
  # rubocop:enable Metrics/MethodLength

  def origin_object
    {
      origin_type: object.parent&.class&.name,
      origin_uid: object.parent&.uid,
    }
  end

  delegate :all_tags_list, to: :object
end

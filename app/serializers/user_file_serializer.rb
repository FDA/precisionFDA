# UserFile serializer.
class UserFileSerializer < NodeSerializer
  attributes(
    :uid,
    :file_size,
    :created_at,
    :created_at_date_time,
    :description,
    :location,
    :links,
    :file_license,
    :show_license_pending,
  )

  def file_size
    number_to_human_size(object.file_size)
  end

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end

  def show_license_pending
    if object.license&.approval_required
      object.license_status?(current_user, "pending")
    else
      false
    end
  end

  # license of the file with selected attributes
  # when file does not have license - return {}
  def file_license
    object.license&.slice(:id, :uid, :title) || {}
  end

  # Check whether object could be licensed - means,
  # current_user is the owner of the object, independently of object scope
  def licenseable
    object.user.id == current_user.id
  end

  # Builds links to files.
  # @return [Hash] Links.
  # rubocop:disable Metrics/MethodLength
  def links
    return {} unless current_user

    # rubocop:disable Metrics/BlockLength
    super.tap do |links|
      links[:show] = "/files/#{object.uid}"
      links[:user] = user_path(object.user.dxuser)
      links[:track] = track_path(id: object.uid)
      links[:space] = space_path if object.in_space?

      # POST download_list files
      links[:download_list] = download_list_api_files_path
      # POST /api/attach_to: api_attach_to_notes, discussions, answers
      links[:attach_to] = api_attach_to_notes_path
      # POST: Add file
      links[:add_file] = api_create_file_path
      # POST: Add folder
      links[:add_folder] = create_folder_api_files_path
      # PUT edit a single file
      links[:update] = api_files_path(object)
      # link to license page if exists
      links[:show_license] = license_path(object.license.id) if object.license

      if object.license.present? && object.license_status?(current_user, "active")
        unless object.license.owned_by_user?(current_user)
          links[:download] = download_api_file_path(object)
          # POST /api/files/copy  copy_api_files
          links[:copy] = copy_api_files_path
        end
      end

      if object.license.present? && !object.license_status?(current_user, "active")
        if object.license&.approval_required
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

      # license exists and accepted
      if object.license.present? &&
         object.license.accepted_licenses.exists?(user_id: current_user.id)
        links[:download] = download_api_file_path(object)
      end

      # any file without license
      if object.license.blank?
        # GET download single file
        links[:download] = download_api_file_path(object)
        # POST /api/files/copy  copy_api_files
        links[:copy] = copy_api_files_path
      end

      if object.owned_by_user?(current_user)
        unless object.in_space? && member_viewer?
          # publish single file if it is not public already and in a root folder
          links[:publish] = publish_object unless object.public? || object.parent_folder_id
          # POST: /api/files/remove - Delete file(s) & folder(s), being selected
          links[:remove] = remove_api_files_path
          # POST associate item to a license
          links[:license] = "/api/licenses/:id/license_item/:item_uid" if licenseable
          if object.license&.owned_by_user?(current_user)
            # GET UserFile license object if exists
            links[:object_license] = api_license_path(object.license&.id)
            # POST detach license from item
            links[:detach_license] = "/api/licenses/:id/remove_item/:item_uid"
          end
          # POST: Move file(s) and folder()s) to other folder
          links[:organize] = move_api_files_path
        end
      end

      if current_user.can_administer_site?
        # PUT /api/files/feature
        links[:feature] = feature_api_files_path
        # POST: Move file(s) and folder()s) to other folder
        links[:organize] = move_api_files_path
      end
    end
    # rubocop:enable Metrics/BlockLength
  end
  # rubocop:enable Metrics/MethodLength
end

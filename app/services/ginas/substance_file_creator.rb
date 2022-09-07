module Ginas
  # Substance file creator
  class SubstanceFileCreator
    class SubstanceFileCreatorError < StandardError; end

    GSRS_TAG = "GSRS".freeze

    def initialize(context)
      @context = context
    end

    def create_and_upload_file(request)
      data = JSON.parse(CGI.unescape(request.raw_post))

      substance_type = data["substanceClass"]&.titleize
      substance_data = data["names"].first
      substance_uuid = substance_data&.fetch("uuid", nil)
      substance_name = substance_data&.fetch("name", nil)

      unless substance_uuid || substance_type || substance_name
        raise SubstanceFileCreatorError, "Can't find the required fields in the substance body"
      end

      file = Files::FileUploader.upload_from_string(
        @context,
        name: substance_file_name(request, substance_name, substance_uuid),
        content: data.to_json,
      )
      file.tag_list.add(GSRS_TAG, substance_type)
      file.save

      move_file_to_folder(file, "#{substance_name}_#{substance_uuid}")

      file
    end

    def move_file_to_folder(file, folder_name)
      folder_service = FolderService.new(@context)

      target_folder = Folder.find_by(
        name: folder_name,
        user: @context.user,
        scope: Scopes::SCOPE_PRIVATE,
      )

      Node.transaction do
        unless target_folder
          result = folder_service.add_folder(folder_name)
          target_folder = result.value if result.success?
        end

        unless target_folder
          logger.error "Can't create a folder for the substance file"
          return
        end

        target_folder.tag_list.add(GSRS_TAG)
        target_folder.save

        result = folder_service.move([file], target_folder)

        if result.failure?
          logger.error "Can't move the substance file to the folder due to: " +
                       result.value[:message]
          raise ActiveRecord::Rollback
        end
      end
    end

    def substance_file_name(request, substance_name, substance_uuid)
      base_name = "#{substance_name}_#{substance_uuid}"

      if request.method == Net::HTTP::Post::METHOD
        "#{base_name}.json"
      else # PUT
        "#{base_name}_edited.json"
      end
    end
  end
end

module Ginas
  # Substance file creator
  class SubstanceFileCreator
    class SubstanceFileCreatorError < StandardError; end

    GSRS_TAG = "GSRS".freeze

    # Expected titleized value of the incoming `substanceClass` field for an
    # SSG4M submission. If NCATS changes the field's casing in a future GSRS
    # release, update this constant (the tag mapping in `create_and_upload_file`
    # relies on an exact match).
    SSG4M_SUBSTANCE_CLASS = "Specified Substance G4m".freeze

    # Tag applied to SSG4M submission files. Specifically requested by the FDA.
    SSG4M_TAG = "Manufacturing process".freeze

    def initialize(context)
      @context = context
    end

    def create_and_upload_ssg4m_file(request)
      data = JSON.parse(request.raw_post)
      submission_data_text = data["sbmsnDataText"]

      raise SubstanceFileCreatorError, "Can't find the required fields in the substance body" if submission_data_text.blank?

      json_data = JSON.parse(submission_data_text)
      substance_type = json_data["substanceClass"]&.titleize

      raise SubstanceFileCreatorError, "Can't find the required fields in the substance body" unless substance_type

      # SSG4M submissions are one-shot: each request (POST or PUT) produces an
      # independent file, so a fresh UUID is generated per call by design.
      name_uuid = SecureRandom.uuid
      file_name = substance_file_name(request, "ssg4m_#{name_uuid}", nil)
      create_and_upload_file(file_name, substance_type, json_data.to_json)
    end

    def create_and_upload_substance_file(request)
      data = JSON.parse(request.raw_post)
      substance_type = data["substanceClass"]&.titleize
      substance_data = data["names"].first
      substance_uuid = substance_data&.fetch("uuid", nil)
      substance_name = substance_data&.fetch("name", nil)

      raise SubstanceFileCreatorError, "Can't find the required fields in the substance body" unless substance_uuid || substance_type || substance_name

      file_name = substance_file_name(request, substance_name, substance_uuid)
      create_and_upload_file(file_name, substance_type, data.to_json)
    end

    def move_file_to_folder(file, folder_name)
      folder_service = FolderService.new(@context)

      target_folder = Folder.find_by(
        name: folder_name,
        user: @context.user,
        scope: Scopes::SCOPE_PRIVATE,
      )

      early_exit = false

      Node.transaction do
        unless target_folder
          result = folder_service.add_folder(folder_name)
          target_folder = result.value if result.success?
        end

        unless target_folder
          logger.error "Can't create a folder for the substance file"
          early_exit = true
          next
        end

        target_folder.tag_list.add(GSRS_TAG)
        target_folder.save

        result = folder_service.move([file], target_folder)

        if result.failure?
          logger.error "Can't move the substance file to the folder due to: #{result.value[:message]}"
          raise ActiveRecord::Rollback
        end
      end

      return if early_exit
    end

    private

    def create_and_upload_file(file_name, substance_type, data)
      file_description = <<~GSRS
        This file still needs to be submitted. Contact the FDA to be added to a shared Space where this file may be placed:
        1. Email fda-srs@fda.hhs.gov requesting a precisionFDA Shared Review Space. Include your precisionFDA login ID.
        2. Upon receiving email prompt, accept the invite to the Shared Review Space to activate it.
        3. Confirm the submission file is closed (file size is visible).
        4. Once the Space is active, select Actions -> Copy to Space. Notify FDA SRS by email that the file is now present in the Shared Review Space.
      GSRS

      file = Files::FileUploader.upload_from_string(
        @context,
        name: file_name,
        content: data,
        description: file_description,
      )
      file.tag_list.add(GSRS_TAG, substance_type == SSG4M_SUBSTANCE_CLASS ? SSG4M_TAG : substance_type)
      file.save

      file
    end

    def substance_file_name(request, substance_name, substance_uuid)
      base_name = substance_uuid ? "#{substance_name}_#{substance_uuid}" : substance_name

      if request.method == Net::HTTP::Post::METHOD
        "#{base_name}.json"
      else # PUT
        "#{base_name}_edited.json"
      end
    end
  end
end

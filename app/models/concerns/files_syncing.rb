# Contains files syncing methods.
# rubocop:todo Metrics/ModuleLength
module FilesSyncing
  extend ActiveSupport::Concern

  # Class methods.
  module ClassMethods
    def sync_challenge_file!(file_id)
      user = User.challenge_bot
      token = CHALLENGE_BOT_TOKEN
      file = user.uploaded_files.find(file_id) # Re-check file id

      return if SYNC_EXCLUDED_FILE_STATES.include?(file.state)

      result = DNAnexusAPI.new(token).call(
        "system",
        "describeDataObjects",
        objects: [file.dxid],
      )["results"][0]

      sync_file_state(result, file, user)
    end

    def sync_file!(context, file_id)
      return if context.guest?

      user = context.user
      file = user.uploaded_files.find(file_id) # Re-check file id
      token = context.token

      return if SYNC_EXCLUDED_FILE_STATES.include?(file.state)

      result = DNAnexusAPI.new(token).call(
        "system",
        "describeDataObjects",
        objects: [file.dxid],
      )["results"][0]

      sync_file_state(result, file, user)
    end

    def sync_files!(context)
      Auditor.suppress do
        return if context.guest?

        user = context.user
        token = context.token

        # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
        user.uploaded_files.
          where.not(state: SYNC_EXCLUDED_FILE_STATES).
          all.each_slice(1000) do |files|
          DNAnexusAPI.new(token).call(
            "system",
            "describeDataObjects",
            objects: files.map(&:dxid),
          )["results"].each_with_index do |result, i|
            sync_file_state(result, files[i], user)
          end
        end
      end
    end

    def sync_challenge_bot_files!(context)
      return if context.guest?

      user = User.challenge_bot
      token = CHALLENGE_BOT_TOKEN

      # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
      user.uploaded_files.where.not(state: SYNC_EXCLUDED_FILE_STATES).all.
        each_slice(1000) do |files|
        DNAnexusAPI.new(token).call(
          "system",
          "describeDataObjects",
          objects: files.map(&:dxid),
        )["results"].each_with_index do |result, i|
          sync_file_state(result, files[i], user)
        end
      end
    end

    def sync_asset!(context, file_id)
      return if context.guest?

      user = context.user
      token = context.token
      file = user.assets.find(file_id) # Re-check file id

      return if SYNC_EXCLUDED_FILE_STATES.include?(file.state)

      result = DNAnexusAPI.new(token).call(
        "system",
        "describeDataObjects",
        objects: [file.dxid],
      )["results"][0]

      sync_file_state(result, file, user)
    end

    def sync_assets!(context)
      return if context.guest?

      user = context.user
      token = context.token

      # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
      user.assets.where.not(state: SYNC_EXCLUDED_FILE_STATES).all.each_slice(1000) do |files|
        DNAnexusAPI.new(token).
          call("system", "describeDataObjects", objects: files.map(&:dxid))["results"].
          each_with_index do |result, i|
            sync_file_state(result, files[i], user)
          end
      end
    end

    # rubocop:todo Metrics/MethodLength
    # rubocop:todo Metrics/BlockNesting
    def sync_file_state(result, file, user)
      if result["statusCode"] == 404
        # File was deleted by the DNAnexus stale file daemon; delete it on our end as well
        UserFile.transaction do
          # Use find_by(file.id) since file.reload may raise ActiveRecord::RecordNotFound
          file = UserFile.find_by(id: file.id)
          if file.present?
            Event::FileDeleted.create_for(file, user)
            file.destroy!
          end
        end
      elsif result["describe"].present?
        remote_state = result["describe"]["state"]

        # Only begin transaction if stale file detected
        if remote_state != file.state
          UserFile.transaction do
            old_file_state = file.state
            file.reload
            # confirm local file state is stale
            if remote_state != file.state
              if remote_state == UserFile::STATE_CLOSED
                file.update!(state: remote_state, file_size: result["describe"]["size"])
                Event::FileCreated.create_for(file, user)
              elsif remote_state == UserFile::STATE_CLOSING && file.state == UserFile::STATE_OPEN ||
                    remote_state == UserFile::STATE_ABANDONED
                file.update!(state: remote_state)
              else
                # NOTE we should never be here
                raise "File #{file.uid} had local state #{file.state} " \
                      "(previously #{old_file_state}) and remote state #{remote_state}"
              end
            end
          end
        end
      else
        # NOTE we should never be here
        raise "Unsupported response for file #{file.uid}: #{result}"
      end
    end
    # rubocop:enable Metrics/BlockNesting
    # rubocop:enable Metrics/MethodLength
  end

  included do
    SYNC_EXCLUDED_FILE_STATES = [
      UserFile::STATE_CLOSED,
      UserFile::STATE_COPYING,
      UserFile::STATE_REMOVING,
    ].freeze

    private_class_method :sync_file_state
  end
end
# rubocop:enable Metrics/ModuleLength

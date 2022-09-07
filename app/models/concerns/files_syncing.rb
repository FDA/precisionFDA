# Contains files syncing methods.
module FilesSyncing
  extend ActiveSupport::Concern

  # Class methods.
  module ClassMethods
    FILES_CHUNK_SIZE = 1000

    SYNC_EXCLUDED_FILE_STATES = [
      UserFile::STATE_CLOSED,
      UserFile::STATE_COPYING,
      UserFile::STATE_REMOVING,
    ].freeze

    def sync_files!(context)
      return if context.guest?

      user = context.user

      Auditor.suppress do
        files = user.uploaded_files.where.not(state: SYNC_EXCLUDED_FILE_STATES).all
        sync_many_files(files, user, context.api)
      end
    end

    def sync_challenge_bot_files!(context)
      return if context.guest?

      user = User.challenge_bot
      files = user.uploaded_files.where.not(state: SYNC_EXCLUDED_FILE_STATES).all
      sync_many_files(files, user, DNAnexusAPI.for_challenge_bot)
    end

    def sync_asset!(context, file_id)
      return if context.guest?

      user = context.user
      file = user.assets.find(file_id) # Re-check file id

      return if SYNC_EXCLUDED_FILE_STATES.include?(file.state)

      result = find_files_on_platform([file.dxid], file.project, context.api).first

      sync_file_state(result, file, user)
    end

    def sync_assets!(context)
      return if context.guest?

      user = context.user
      assets = user.assets.where.not(state: SYNC_EXCLUDED_FILE_STATES).all

      sync_many_files(assets, user, context.api)
    end

    def sync_challenge_file!(file_id)
      user = User.challenge_bot
      file = user.uploaded_files.find(file_id) # Re-check file id

      return if SYNC_EXCLUDED_FILE_STATES.include?(file.state)

      api = DNAnexusAPI.for_challenge_bot
      result = find_files_on_platform([file.dxid], file.project, api).first
      sync_file_state(result, file, user)
    end

    def sync_file!(context, file_id)
      return if context.guest?

      user = context.user
      file = user.uploaded_files.find(file_id) # Re-check file id

      return if SYNC_EXCLUDED_FILE_STATES.include?(file.state)

      result = find_files_on_platform([file.dxid], file.project, context.api).first
      sync_file_state(result, file, user)
    end

    def sync_file_state(result, file, user)
      return remove_local_file(file, user) unless result

      remote_state = result[:describe][:state]
      return if remote_state == file.state

      UserFile.transaction do
        old_file_state = file.state
        file.reload

        return if remote_state == file.state

        logger.debug("SyncFilesState: update file #{file.uid} by user #{user.dxuser} " \
                     "from state #{file.state} to #{remote_state}")

        if remote_state == UserFile::STATE_CLOSED
          file.update!(state: remote_state, file_size: result[:describe][:size])
          Event::FileCreated.create_for(file, user)
          logger.debug("SyncFilesState: created new file #{file.uid}")
        elsif (remote_state == UserFile::STATE_CLOSING && file.state == UserFile::STATE_OPEN) ||
              remote_state == UserFile::STATE_ABANDONED
          file.update!(state: remote_state)
          logger.debug("SyncFilesState: updated file state to #{file.state} from #{remote_state}")
        else
          # NOTE we should never be here
          raise "SyncFilesState: File #{file.uid} had local state #{file.state} " \
                "(previously #{old_file_state}) and remote state #{remote_state}"
        end
      end
    end

    # Syncs multiple files or assets grouped by a project using findDataObjects platform call.
    def sync_many_files(files, user, api)
      files.group_by(&:project).each do |project, project_files|
        project_files.each_slice(FILES_CHUNK_SIZE) do |files_chunk|
          results = find_files_on_platform(files_chunk.map(&:dxid), project, api)

          files_chunk.each do |file|
            res = results.find { |r| r[:id] == file.dxid }
            # means that file doesn't exist on the platform anymore
            remove_local_file(file, user) unless res
            sync_file_state(res, file, user)
          end
        end
      end
    end

    # File was deleted by the DNAnexus stale file daemon; delete it on our end as well
    def remove_local_file(file, user)
      logger.debug("removing local file #{file.uid} by user #{user.dxuser}")
      UserFile.transaction do
        # Use find_by(file.id) since file.reload may raise ActiveRecord::RecordNotFound
        file = UserFile.find_by(id: file.id)
        return unless file

        Event::FileDeleted.create_for(file, user)
        file.destroy!
      end
    end

    def find_files_on_platform(dxids, project, api)
      api.system_find_data_objects(
        id: dxids,
        scope: { project: project },
        class: "file",
        describe: true,
      )[:results]
    end
  end

  included do
    private_class_method :sync_many_files
    private_class_method :sync_file_state
    private_class_method :remove_local_file
    private_class_method :find_files_on_platform
  end
end

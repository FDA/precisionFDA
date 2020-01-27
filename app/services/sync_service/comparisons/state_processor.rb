module SyncService
  module Comparisons
    # Responsible for processing job depending on state.
    class StateProcessor
      # Constructor.
      # @param user_api [DNAnexusAPI] User API.
      def initialize(user_api)
        @user_api = user_api
      end

      # Processes job depending on job's state.
      # @param user [User] User to run processor for.
      # @param job [Hash] Job's description from the platform.
      # @param comparison [Comparison] Comparison the job relates to.
      # @return [Array]
      # @raise [JobFailedError] if job is in failed state.
      # @raise [EmptyMetaError] if meta is empty.
      def call(user, job, comparison)
        state = job["state"]

        # Already synchronized.
        return if state == comparison.state

        case state
        when Job::STATE_DONE
          process_done_job(user, job)
        when Job::STATE_FAILED
          raise JobFailedError
        else
          return
        end
      end

      private

      # Processes job in done state.
      # @param job [Hash] Job description from the platform.
      # @return [Array<Array<String>, Array<Hash>>] Returns and array of results where
      #   first element is job's meta data, second is array of user files attributes.
      # @raise [EmptyMetaError] if meta is empty.
      def process_done_job(user, job)
        meta = job.dig("output", "meta")

        raise EmptyMetaError if meta.blank?

        meta["weighted_roc"]["data"] = meta["weighted_roc"]["data"].last(100)
        output_keys = []
        output_ids = []
        output_files = []

        job["output"].each_key do |key|
          # NOTE: meta is the only field of result["describe"]["output"] modified
          next if key == "meta"

          output_keys << key
          output_ids << job["output"][key]["$dnanexus_link"]
        end

        files_descriptions(output_ids).each_with_index do |output_file, i|
          describe = output_file["describe"]

          raise InvalidFileStateError unless describe["state"] == UserFile::STATE_CLOSED

          output_files.push(
            dxid: output_ids[i],
            project: user.private_comparisons_project,
            name: describe["name"],
            state: UserFile::STATE_CLOSED,
            description: output_keys[i],
            user_id: user.id,
            scope: UserFile::SCOPE_PRIVATE,
            file_size: describe["size"],
          )
        end

        [meta, output_files]
      end

      # Returns output files' description from the platform.
      # @param files_dxids [Array<String>] Files's dxids to describe.
      # @return [Array<Hash>] Files' descriptions.
      def files_descriptions(files_dxids)
        @user_api.system_describe_data_objects(files_dxids)["results"]
      end
    end
  end
end

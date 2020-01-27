module SyncService
  module Comparisons
    # Responsible for comparisons synchronization.
    class Synchronizer
      # Constructor.
      # @param user_api [DNAnexusAPI] User API.
      def initialize(user_api, comparison_filter, comparison_processor)
        @user_api = user_api
        @comparison_filter = comparison_filter
        @comparison_processor = comparison_processor
      end

      # Synchronizes comparisons.
      # @param user [User] User to call synchronizer for.
      # @param ids [Array<Integer>] User comparisons' ids to synchronize.
      def sync_comparisons!(user, ids = [])
        filter_comparisons(user, ids).each_slice(1_000) do |comparisons|
          comparisons_hash = build_comparison_hash(comparisons)

          find_jobs(user.private_comparisons_project, comparisons_hash.keys).each do |job|
            describe = job["describe"]
            process_comparison(user, describe, comparisons_hash[describe["id"]])
          end
        end
      end

      private

      # Filters comparisons.
      # @param ids [Array<Integer>] User comparisons' ids to synchronize.
      # @return [ActiveRecord::Relation<Comparison>] Filtered comparisons.
      def filter_comparisons(user, ids = [])
        @comparison_filter.call(user, ids)
      end

      # Processes comparison and updates it depending on job's state.
      # @param job [Hash] Job description from the platform.
      # @param comparison [Comparison] Comparison to process.
      def process_comparison(user, job, comparison)
        @comparison_processor.call(user, comparison, job)
      end

      # Builds hash of form { job_dxid => Comparison }.
      # @param comparisons [ActiveRecord::Relation<Comparison>] Comparisons to build hash for.
      # @return [Hash] Built hash.
      def build_comparison_hash(comparisons)
        comparisons.map { |c| [c.dxjobid, c] }.to_h
      end

      # Returns jobs description from the platform.
      # @param jobs_dxids [Array<String>] Jobs dxids.
      # @return [Array<Hash>] Jobs descriptions.
      def find_jobs(project, jobs_dxids)
        @user_api.system_find_jobs(
          includeSubjobs: false,
          id: jobs_dxids,
          project: project,
          parentJob: nil,
          parentAnalysis: nil,
          describe: true,
        )["results"]
      end
    end
  end
end

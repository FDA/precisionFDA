module SyncService
  module Comparisons
    # Responsible for comparison processing.
    class ComparisonProcessor
      # Constructor.
      # @param state_processor [#call] Comparisons's state processor.
      # @param comparison_updater [#done!, #failed!] Comparison updater.
      def initialize(state_processor, comparison_updater)
        @state_processor = state_processor
        @comparison_updater = comparison_updater
      end

      # Processes comparison and updates its data.
      # @param user [User] User to run processing for.
      # @param comparison [Comparison] Comparison to process.
      # @param job [Hash] Job description from platform.
      def call(user, comparison, job)
        meta, output_files = @state_processor.call(user, job, comparison)
        return if meta.blank? || output_files.blank?

        @comparison_updater.done!(comparison, output_files, meta, user)
      rescue EmptyMetaError, JobFailedError
        @comparison_updater.failed!(comparison)
      end
    end
  end
end

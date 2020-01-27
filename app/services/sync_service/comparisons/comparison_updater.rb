module SyncService
  module Comparisons
    # Responsible for comparison update.
    module ComparisonUpdater
      extend self

      # Updates successfully finished comparison.
      # @param comparison [Comparison] Comparison to update.
      # @param output_files [Array<Hash>] Comparison output files' attributes.
      # @param meta [Array] Meta information from job.
      # @param user [User] User to run comparison for.
      def done!(comparison, output_files, meta, user)
        comparison.reload
        return if comparison.state == Comparison::STATE_DONE

        ActiveRecord::Base.transaction do
          output_files.each do |output_file|
            file = UserFile.create!(output_file.merge(parent: comparison))
            Event::FileCreated.create_for(file, user)
          end

          comparison.update!(meta: meta, state: Comparison::STATE_DONE)
        end
      end

      # Processes failed state.
      # @param comparison [Comparison] Comparison to update.
      def failed!(comparison)
        comparison.update!(state: Comparison::STATE_FAILED)
      end
    end
  end
end

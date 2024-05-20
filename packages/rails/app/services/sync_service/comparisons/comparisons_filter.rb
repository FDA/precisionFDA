module SyncService
  module Comparisons
    # Responsible for filtering comparisons.
    module ComparisonsFilter
      extend self

      # Filters comparisons.
      # @param ids [Array<Integer>] User comparisons' ids to synchronize.
      # @return [ActiveRecord::Relation<Comparison>] Filtered comparisons.
      def call(user, ids = [])
        conditions = { user_id: user.id, state: Comparison::STATE_PENDING }
        conditions[:id] = ids if ids.present?

        Comparison.where(conditions)
      end
    end
  end
end

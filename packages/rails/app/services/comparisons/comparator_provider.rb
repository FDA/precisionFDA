module Comparisons
  # Tries to provide comparator app.
  module ComparatorProvider
    extend self

    # Returns comparator app.
    # @param comparator_dxid [String] Dxid of comparator.
    # @return [App, nil] Returns comparator if it was found, nil otherwise.
    def call(comparator_dxid)
      Setting.comparator_apps.include?(comparator_dxid) ? App.find_by(dxid: comparator_dxid) : nil
    end
  end
end

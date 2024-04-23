module DbClusters
  # Responsible for filtering db clusters.
  class Filter
    extend ::BaseFilter

    DB_CLUSTER_TABLE = DbCluster.arel_table

    FILTER_FIELDS = {
      "name" => ->(value) { condition(DB_CLUSTER_TABLE[:name], value) },
      "status" => lambda do |value|
        condition(DB_CLUSTER_TABLE[:status], enum_values(DbCluster.statuses, value))
      end,
      "type" => lambda do |value|
        condition(DB_CLUSTER_TABLE[:engine], enum_values(DbCluster.engines, value))
      end,
      "instance" => ->(value) { condition(DB_CLUSTER_TABLE[:dx_instance_class], value) },
    }.freeze

    class << self
      private

      def enum_values(values, match)
        values.select { |value| value =~ Regexp.new(match) }.values
      end
    end
  end
end

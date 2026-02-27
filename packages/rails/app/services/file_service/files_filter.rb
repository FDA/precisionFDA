module FileService
  # Responsible for filtering nodes.
  class FilesFilter
    extend ::BaseFilter

    NODE_TABLE = Node.arel_table
    USER_TABLE = User.arel_table

    FILTER_FIELDS = {
      "name" => ->(value) { condition(NODE_TABLE[:name], value) },
      "filter" => ->(value) { NODE_TABLE[:name].matches(value) }, # used by CLI name matching wildcards
      "state" => ->(value) { condition(NODE_TABLE[:state], value) },
      "size" => ->(value) { NODE_TABLE[:file_size].gteq(value.to_i * 1024) }, # in Kb
      "size2" => ->(value) { NODE_TABLE[:file_size].lteq(value.to_i * 1024) }, # in Kb
      "featured" => ->(value) { NODE_TABLE[:featured].eq(to_bool(value)) },
      "location" => lambda do |value|
        scopes = Space.where(condition(Space.arel_table[:name], value)).map(&:uid)
        condition(NODE_TABLE[:scope], scopes)
      end,
      "username" => lambda do |value|
        pattern = Arel::Nodes.build_quoted(sanitize(value))
        fn, ln = USER_TABLE[:first_name], USER_TABLE[:last_name]
        first_last = Arel::Nodes::NamedFunction.new("CONCAT", [fn, Arel::Nodes.build_quoted(" "), ln])
        last_first = Arel::Nodes::NamedFunction.new("CONCAT", [ln, Arel::Nodes.build_quoted(" "), fn])
        Arel::Nodes::Matches.new(first_last, pattern).or(Arel::Nodes::Matches.new(last_first, pattern))
      end,
    }.freeze
  end
end

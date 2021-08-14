module FileService
  # Responsible for filtering nodes.
  class FilesFilter
    extend ::BaseFilter

    NODE_TABLE = Node.arel_table
    USER_TABLE = User.arel_table

    FILTER_FIELDS = {
      "name" => ->(value) { condition(NODE_TABLE[:name], value) },
      "state" => ->(value) { condition(NODE_TABLE[:state], value) },
      "size" => ->(value) { NODE_TABLE[:file_size].gteq(value.to_i * 1024) }, # in Kb
      "size2" => ->(value) { NODE_TABLE[:file_size].lteq(value.to_i * 1024) }, # in Kb
      "featured" => ->(value) { NODE_TABLE[:featured].eq(to_bool(value)) },
      "location" => lambda do |value|
        scopes = Space.where(condition(Space.arel_table[:name], value)).map(&:uid)
        condition(NODE_TABLE[:scope], scopes)
      end,
      "username" => lambda do |value|
        condition(USER_TABLE[:first_name], value).or(condition(USER_TABLE[:last_name], value))
      end,
    }.freeze
  end
end

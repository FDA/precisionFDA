module FileService
  # Responsible for filtering nodes.
  class FilesFilter
    extend ::BaseFilter

    NODE_TABLE = Node.arel_table
    USER_TABLE = User.arel_table

    FILTER_FIELDS = {
      "name" => ->(value) { condition(NODE_TABLE[:name], value) },
      "state" => ->(value) { condition(NODE_TABLE[:state], value) },
      "size" => ->(value) { NODE_TABLE[:file_size].gteq(value) },
      "size2" => ->(value) { NODE_TABLE[:file_size].lteq(value) },
      "username" => lambda do |value|
        condition(USER_TABLE[:first_name], value).or(condition(USER_TABLE[:last_name], value))
      end,
    }.freeze
  end
end

module JobService
  # Responsible for filtering nodes.
  class JobsFilter
    extend ::BaseFilter

    APP_TABLE = App.arel_table
    JOB_TABLE = Job.arel_table
    USER_TABLE = User.arel_table
    WORKFLOW_TABLE = Workflow.arel_table

    FILTER_FIELDS = {
      "name" => lambda do |value|
        condition(WORKFLOW_TABLE[:name], value).or(condition(JOB_TABLE[:name], value))
      end,
      "state" => ->(value) { condition(JOB_TABLE[:state], value) },
      "app_title" => ->(value) { condition(APP_TABLE[:title], value) },
      "workflow_title" => ->(value) { condition(WORKFLOW_TABLE[:title], value) },
      "featured" => ->(value) { JOB_TABLE[:featured].eq(to_bool(value)) },
      "location" => lambda do |value|
        scopes = Space.where(condition(Space.arel_table[:name], value)).map(&:uid)
        condition(JOB_TABLE[:scope], scopes)
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

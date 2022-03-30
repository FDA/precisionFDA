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
        condition(WORKFLOW_TABLE[:title], value).or(condition(JOB_TABLE[:name], value))
      end,
      "state" => ->(value) { condition(JOB_TABLE[:state], value) },
      "app_title" => ->(value) { condition(APP_TABLE[:title], value) },
      "featured" => ->(value) { JOB_TABLE[:featured].eq(to_bool(value)) },
      "location" => lambda do |value|
        scopes = Space.where(condition(Space.arel_table[:name], value)).map(&:uid)
        condition(JOB_TABLE[:scope], scopes)
      end,
      "username" => lambda do |value|
        condition(USER_TABLE[:first_name], value).or(condition(USER_TABLE[:last_name], value))
      end,
    }.freeze
  end
end

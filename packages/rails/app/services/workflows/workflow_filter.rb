module Workflows
  # Responsible for filtering nodes.
  class WorkflowFilter
    extend ::BaseFilter

    WORKFLOW_SERIES_TABLE = WorkflowSeries.arel_table
    WORKFLOW_TABLE = Workflow.arel_table
    USER_TABLE = User.arel_table

    FILTER_FIELDS = {
      "name" => ->(value) { condition(WORKFLOW_SERIES_TABLE[:name], value) },
      "title" => ->(value) { condition(WORKFLOW_TABLE[:title], value) },
      "revision" => ->(value) { condition(WORKFLOW_TABLE[:revision], value.to_i) },
      "featured" => ->(value) { WORKFLOW_TABLE[:featured].eq(to_bool(value)) },
      "username" => lambda do |value|
        condition(USER_TABLE[:first_name], value).or(condition(USER_TABLE[:last_name], value))
      end,
    }.freeze

    MATCH_FIELDS = {
      "name" => ->(work, value) { work.name.downcase.include? value },
      "title" => ->(work, value) { work.title.downcase.include? value },
      "revision" => ->(work, value) { work.revision == value.to_i },
      "username" => ->(work, value) { work.user.full_name.downcase.include? value },
      "addedBy" => ->(work, value) { work.user.full_name.downcase.include? value },
      "featured" => ->(app, value) { app.featured.to_s == value },
      "location" => lambda do |workflow, value|
        workflow.in_space? && workflow.space_object.name.downcase.include?(value)
      end,
      "tags" => ->(work, value) { work.workflow_series.all_tags_list.to_s.downcase.include? value },
    }.freeze
  end
end

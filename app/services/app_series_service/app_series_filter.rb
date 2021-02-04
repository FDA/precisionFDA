module AppSeriesService
  # Responsible for filtering nodes.
  class AppSeriesFilter
    extend ::BaseFilter

    APP_SERIES_TABLE = AppSeries.arel_table
    APP_TABLE = App.arel_table
    USER_TABLE = User.arel_table

    FILTER_FIELDS = {
      "name" => ->(value) { condition(APP_SERIES_TABLE[:name], value) },
      "title" => ->(value) { condition(APP_TABLE[:name], value) },
      "revision" => ->(value) { condition(APP_TABLE[:revision], value.to_i) },
      "username" => lambda do |value|
        condition(USER_TABLE[:first_name], value).or(condition(USER_TABLE[:last_name], value))
      end,
    }.freeze

    MATCH_FIELDS = {
      "name" => ->(app, value) { app.name.downcase.include? value },
      "title" => ->(app, value) { app.title.downcase.include? value },
      "revision" => ->(app, value) { app.revision == value.to_i },
      "username" => ->(app, value) { app.user.full_name.downcase.include? value },
      "tags" => ->(app, value) { app.app_series.all_tags_list.to_s.downcase.include? value },
    }.freeze
  end
end

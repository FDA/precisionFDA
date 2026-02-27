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
      "featured" => ->(value) { APP_TABLE[:featured].eq(to_bool(value)) },
      "username" => lambda do |value|
        pattern = Arel::Nodes.build_quoted(sanitize(value))
        fn, ln = USER_TABLE[:first_name], USER_TABLE[:last_name]
        first_last = Arel::Nodes::NamedFunction.new("CONCAT", [fn, Arel::Nodes.build_quoted(" "), ln])
        last_first = Arel::Nodes::NamedFunction.new("CONCAT", [ln, Arel::Nodes.build_quoted(" "), fn])
        Arel::Nodes::Matches.new(first_last, pattern).or(Arel::Nodes::Matches.new(last_first, pattern))
      end,
    }.freeze

    MATCH_FIELDS = {
      "name" => ->(app, value) { app.name.downcase.include? value },
      "title" => ->(app, value) { app.title.downcase.include? value },
      "revision" => ->(app, value) { app.revision == value.to_i },
      "username" => ->(app, value) { app.user.full_name.downcase.include? value },
      "featured" => ->(app, value) { app.featured.to_s == value },
      "location" => lambda do |app, value|
        app.in_space? && app.space_object.name.downcase.include?(value)
      end,
      "tags" => ->(app, value) { app.app_series.all_tags_list.to_s.downcase.include? value },
    }.freeze
  end
end

module UsageReportsHelper
  def selected_range_name(range)
    case range
    when "day"
      "daily"
    when "month"
      "monthly"
    when "year"
      "yearly"
    when "cumulative"
      "cumulative"
    when "custom"
      "custom_range"
    else
      "weekly"
    end
  end
end
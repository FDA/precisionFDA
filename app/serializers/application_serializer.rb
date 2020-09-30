# Top-level application serializer.
class ApplicationSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  protected

  # Returns formatted time.
  # @param time [Time, DateTime] Time object.
  # @return [String] Formatted time.
  def formatted_time(time)
    time.strftime("%m/%d/%Y")
  end

  # Returns formatted time.
  # @param time [Time, DateTime] Time object.
  # @return [String] Formatted time with separate Date, Time and Zone.
  def formatted_date_time(time)
    time.strftime("%Y-%m-%d %H:%M:%S %Z")
  end
end

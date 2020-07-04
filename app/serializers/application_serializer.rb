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
end

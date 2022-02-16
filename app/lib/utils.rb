# Collection of methods that can be used accross the whole project.
module Utils
  extend self

  def aws_env?
    Rails.env.production? || Rails.env.staging? || Rails.env.dev?
  end

  # rubocop:todo Rails/UnknownEnv
  def development_or_test?
    Rails.env.development? || Rails.env.test? || Rails.env.ui_test?
  end
  # rubocop:enable Rails/UnknownEnv

  # Iterates an array with a delay between each iteration.
  # @param collection [#each, #last] The collection to iterate on.
  # @param delay [Integer|Float] The delay in seconds.
  def each_with_delay(collection, delay = 1)
    collection.each do |item|
      yield item

      sleep(delay) if item != collection.last
    end
  end
end

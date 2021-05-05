# Collection of methods that can be used accross the whole project.
module Utils
  extend self

  PRODUCTION_ENV = "production".freeze

  # Iterates an array with a delay between each iteration.
  # @param collection [#each, #last] The collection to iterate on.
  # @param delay [Integer|Float] The delay in seconds.
  def each_with_delay(collection, delay = 1)
    collection.each do |item|
      yield item

      sleep(delay) if item != collection.last
    end
  end

  def production_env?
    ENV["DNANEXUS_BACKEND"] == PRODUCTION_ENV
  end

  # rubocop:todo Rails/UnknownEnv
  def stage_or_prod_env?
    ENV["DNANEXUS_BACKEND"] == PRODUCTION_ENV ||
      !(Rails.env.development? || Rails.env.ui_test? || ENV["DEV_HOST"])
  end

  def development_or_test?
    Rails.env.development? || Rails.env.test? || Rails.env.ui_test?
  end
  # rubocop:enable Rails/UnknownEnv
end

module Utils
  extend self

  # rubocop:todo Rails/UnknownEnv
  def stage_or_prod_env?
    ENV["DNANEXUS_BACKEND"] == "production" ||
      !(Rails.env.development? || Rails.env.ui_test? || ENV["DEV_HOST"])
  end
  # rubocop:enable Rails/UnknownEnv
end

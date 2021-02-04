# == Schema Information
#
# Table name: apps
#
#  id            :integer          not null, primary key
#  dxid          :string(255)
#  version       :string(255)
#  revision      :integer
#  title         :string(255)
#  readme        :text(65535)
#  user_id       :integer
#  scope         :string(255)
#  spec          :text(65535)
#  internal      :text(65535)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  app_series_id :integer
#  verified      :boolean          default(FALSE), not null
#  uid           :string(255)
#  dev_group     :string(255)
#  release       :string(255)      not null
#

FactoryBot.define do
  factory :app do
    app_series

    title { "default_title" }
    scope { App::SCOPE_PRIVATE }
    dxid { "app-#{SecureRandom.hex(12)}" }
    release { UBUNTU_14 }
  end

  factory :app_with_series, class: "App" do
    app_series

    title { "default_title" }
    scope { App::SCOPE_PRIVATE }
    dxid { "app-#{SecureRandom.hex(12)}" }
    release { UBUNTU_14 }

    after(:create) do |app|
      app.app_series.update(latest_revision_app_id: app.id, latest_version_app_id: app.id)
    end
  end
end

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
#

FactoryBot.define do
  factory :app do
    title { "default_title" }
    scope { "private" }
    association :app_series
    sequence(:dxid) { |n| "app-#{SecureRandom.hex(12)}" }
  end
end

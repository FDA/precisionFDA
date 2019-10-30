# == Schema Information
#
# Table name: app_series
#
#  id                     :integer          not null, primary key
#  dxid                   :string(255)
#  name                   :string(255)
#  latest_revision_app_id :integer
#  latest_version_app_id  :integer
#  user_id                :integer
#  scope                  :string(255)
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  verified               :boolean          default(FALSE), not null
#

FactoryBot.define do
  factory :app_series do
    scope { "private" }
  end
end

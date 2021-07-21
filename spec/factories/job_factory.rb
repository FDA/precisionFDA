# == Schema Information
#
# Table name: jobs
#
#  id              :integer          not null, primary key
#  dxid            :string(255)
#  app_id          :integer
#  project         :string(255)
#  run_data        :text(65535)
#  describe        :text(65535)
#  provenance      :text(65535)
#  state           :string(255)
#  name            :string(255)
#  user_id         :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  app_series_id   :integer
#  scope           :string(255)
#  analysis_id     :integer
#  uid             :string(255)
#  local_folder_id :integer
#  entity_type     :integer          default("regular"), not null
#  featured        :boolean          default(FALSE)
#

FactoryBot.define do
  factory :job do
    name { "default_title" }
    association :app_series
    sequence(:dxid) { "job-#{SecureRandom.hex(12)}" }
  end
end

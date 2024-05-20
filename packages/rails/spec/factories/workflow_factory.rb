# == Schema Information
#
# Table name: workflows
#
#  id                 :integer          not null, primary key
#  title              :string(255)
#  name               :string(255)
#  dxid               :string(255)
#  user_id            :integer
#  readme             :text(65535)
#  edit_version       :string(255)
#  spec               :text(65535)
#  default_instance   :string(255)
#  scope              :string(255)
#  revision           :integer
#  workflow_series_id :integer
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  uid                :string(255)
#  project            :string(255)
#  featured           :boolean          default(FALSE)
#  deleted            :boolean          default(FALSE), not null
#

FactoryBot.define do
  factory :workflow do
    workflow_series

    dxid { "workflow-#{SecureRandom.hex(12)}" }
    project { "project-#{SecureRandom.hex(12)}" }
    scope { Scopes::SCOPE_PRIVATE }
    title { "default_title" }
    name { "default_name" }
    revision { 1 }
    spec { { "input_spec": { "stages": [] } } }

    after(:create) do |workflow|
      workflow.workflow_series.update!(latest_revision_workflow: workflow)
    end
  end
end

# == Schema Information
#
# Table name: workflow_series
#
#  id                          :integer          not null, primary key
#  dxid                        :string(255)
#  name                        :string(255)
#  latest_revision_workflow_id :integer
#  user_id                     :integer
#  scope                       :string(255)
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  featured                    :boolean          default(FALSE)
#  deleted                     :boolean          default(FALSE), not null
#

FactoryBot.define do
  factory :workflow_series do
  end
end

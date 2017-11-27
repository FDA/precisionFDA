# == Schema Information
#
# Table name: workflow_series
#
#  id                          :integer          not null, primary key
#  dxid                        :string
#  name                        :string
#  latest_revision_workflow_id :integer
#  user_id                     :integer
#  scope                       :string
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#

class WorkflowSeries < ActiveRecord::Base
  include Permissions

  has_many :workflows
  belongs_to :latest_revision_workflow, class_name: 'Workflow'
  belongs_to :user

  acts_as_taggable

  def uid
    "workflow-series-#{id}"
  end

  def klass
    "workflow-series"
  end

  def title
    name
  end

  def self.construct_dxid(username, name)
    "app-#{construct_dxname(username, name)}"
  end

  def self.construct_dxname(username, name)
    "-#{username}-#{name}"
  end

  def accessible_revisions(context)
    workflows.accessible_by(context).order(revision: :desc)
  end

  def latest_accessible(context)
    accessible_by?(context) ? latest_revision_workflow : nil
  end
end

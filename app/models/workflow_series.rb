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
#  deleted                     :boolean          default(FALSE)
#

class WorkflowSeries < ApplicationRecord
  include Auditor
  include Permissions
  include CommonPermissions
  include Featured
  include SoftRemovable
  include TagsContainer

  has_many :workflows
  belongs_to :latest_revision_workflow, class_name: "Workflow"
  belongs_to :user

  acts_as_votable

  alias_attribute :title, :name

  class << self
    # Returns workflows count of user 'private' scope.
    # Is used in for user serializer in Home.
    # @param [User] User object.
    # @return [Integer] workflows count.
    # TODO: add rspec
    def private_count(user)
      count = 0
      workflow_series = accessible_by_private.where(user_id: user.id)
      workflow_series.each do |workflow_serie|
        latest = workflow_serie.latest_revision_workflow
        count += 1 if latest&.scope == "private" && latest&.not_deleted?
      end

      count
    end

    # FIXME: double-dash dxid.. Why?
    def construct_dxid(username, name)
      "app-#{construct_dxname(username, name)}"
    end

    def construct_dxname(username, name)
      "-#{username}-#{name}"
    end
  end

  def klass
    "workflow-series"
  end

  def uid
    "#{klass}-#{id}"
  end

  def accessible_revisions(context)
    workflows.accessible_by(context).order(revision: :desc)
  end

  def latest_accessible(context)
    accessible_by?(context) ? latest_revision_workflow : nil
  end
end

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

class Workflow < ApplicationRecord
  include Auditor
  include Permissions
  include CommonPermissions
  include InternalUid
  include Featured
  include ObjectLocation
  include SoftRemovable
  include TagsContainer

  belongs_to :user
  belongs_to :workflow_series
  has_many :analyses, dependent: :destroy
  has_many :properties, through: :workflow_series, source: :properties

  store :spec, accessors: [:input_spec, :output_spec, :internet_access, :instance_type], coder: JSON

  acts_as_commentable

  attr_accessor :current_user

  before_update { |workflow| workflow.update_series_featured_status if workflow.featured_changed? }
  before_update { |workflow| workflow.update_series_deleted_status if workflow.deleted_changed? }

  class << self
    # TODO: this method looks similar to the same methods in other models.
    def publication_project(user, scope)
      if scope == Scopes::SCOPE_PUBLIC
        user.public_files_project
      else
        Space.from_scope(scope).project_for_user(user)
      end
    end
  end

  def stages
    input_spec["stages"]
  end

  def stage(slot_id)
    stages.find { |stage| stage[:slotId] == slot_id }
  end


  def all_input_spec
    stages.reduce([]) { |inputs, stage| inputs + stage["inputs"] }
  end

  def all_output_spec
    stages.reduce([]) { |outputs, stage| outputs + stage["outputs"] }
  end

  def apps
    @apps ||= App.where(uid: stages.map { |stage| stage["app_uid"] })
  end

  def stages_apps
    @apps ||= stages.map { |stage| App.find_by(dxid: stage["app_dxid"]) }
  end

  def to_param
    uid
  end

  def jobs
    Job.where(analysis_id: analyses.pluck(:id)).includes(:analysis)
  end

  def klass
    "workflow"
  end

  def publishable_by?(context, scope_to_publish_to = "public")
    return false if scope_to_publish_to == "public" || !private?
    super
  end

  def input_spec_hash
    hash = {}
    all_input_spec.each do |input_spec|
      hash[input_spec["parent_slot"]] ||= {}
      hash[input_spec["parent_slot"]][input_spec["name"]] = input_spec
    end
    hash
  end

  def unused_input_spec
    stages.each_with_object([]) do |stage, unused_inputs|
      stage["inputs"].each do |input|
        unused_inputs << input unless input["values"]["id"]
      end
    end
  end

  def unused_output_spec
    stages.each_with_object([]) do |stage, unused_outputs|
      stage["outputs"].each do |output|
        unused_outputs << output unless output["values"]["id"]
      end
    end
  end

  def unused_input_spec_hash
    hash = {}
    unused_input_spec.each do |input_spec|
      hash[input_spec["parent_slot"]] ||= {}
      hash[input_spec["parent_slot"]][input_spec["name"]] = input_spec
    end
    hash
  end

  def accessible_scopes
    return [scope] unless in_space?
    Space.from_scope(scope).accessible_scopes
  end

  def stages_ids
    stages.map { |stage| stage['slotId'] }
  end

  def update_stages!(stages)
    self.input_spec = input_spec.merge("stages" => stages)
    save!
  end

  def describe_fields
    %w(title name edit_version revision readme spec dxid uid)
  end

  def update_series_featured_status
    workflow_series.update(featured: featured)
  end

  def update_series_deleted_status
    workflow_series.update(deleted: deleted)
  end
end
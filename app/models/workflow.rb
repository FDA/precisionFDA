# == Schema Information
#
# Table name: workflows
#
#  id                  :integer          not null, primary key
#  title               :string
#  name                :string
#  dxid                :string
#  user_id             :integer
#  readme              :text
#  edit_version        :string
#  spec                :text
#  default_instance    :string
#  scope               :string
#  revision            :integer
#  workflow_series_id :integer
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#

class Workflow < ActiveRecord::Base
  include Auditor
  include Permissions
  include InternalUid

  belongs_to :user
  belongs_to :workflow_series
  has_many :analyses

  store :spec, accessors: [:input_spec, :output_spec, :internet_access, :instance_type], coder: JSON

  acts_as_commentable

  def stages
    input_spec["stages"]
  end

  def stage(slot_id)
    stages.find { |stage| stage[:slotId] == slot_id }
  end

  def allow_batch_run?
    return unless stages.any?
    batch_input_spec.select { |s| s["allow_batch"] }.any?
  end

  def batch_input_spec
    app = stages.find { |s| s["prev_slot"].nil? }
    slot_id = app["slotId"]
    all_input_spec.map do |input|
      input["allow_batch"] = allow_batch?(input, slot_id)
      input
    end
  end

  def allow_batch?(input, slot_id)
    input["parent_slot"] == slot_id && input["requiredRunInput"] && %w(file string).include?(input["class"])
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
end

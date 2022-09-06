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
#  featured        :boolean          default(FALSE)
#  entity_type     :integer          default("regular"), not null
#

class Job < ApplicationRecord
  include Auditor
  include Permissions
  include CommonPermissions
  include Featured
  include InternalUid
  include JobsSyncing
  include ObjectLocation
  include Scopes
  include TagsContainer

  INSTANCE_TYPES = {
    "baseline-2" => "mem1_ssd1_x2_fedramp",
    "baseline-4" => "mem1_ssd1_x4_fedramp",
    "baseline-8" => "mem1_ssd1_x8_fedramp",
    "baseline-16" => "mem1_ssd1_x16_fedramp",
    "baseline-36" => "mem1_ssd1_x36_fedramp",
    "himem-2" => "mem3_ssd1_x2_fedramp",
    "himem-4" => "mem3_ssd1_x4_fedramp",
    "himem-8" => "mem3_ssd1_x8_fedramp",
    "himem-16" => "mem3_ssd1_x16_fedramp",
    "himem-32" => "mem3_ssd1_x32_fedramp",
    "hidisk-2" => "mem1_ssd2_x2_fedramp",
    "hidisk-4" => "mem1_ssd2_x4_fedramp",
    "hidisk-8" => "mem1_ssd2_x8_fedramp",
    "hidisk-16" => "mem1_ssd2_x16_fedramp",
    "hidisk-36" => "mem1_ssd2_x36_fedramp",
    "gpu-8" => "mem3_ssd1_gpu_x8_fedramp",
  }.freeze

  STATE_DONE = "done".freeze
  STATE_FAILED = "failed".freeze
  STATE_IDLE = "idle".freeze
  STATE_RUNNING = "running".freeze
  STATE_TERMINATED = "terminated".freeze
  STATE_TERMINATING = "terminating".freeze

  TERMINAL_STATES = [STATE_TERMINATED, STATE_DONE, STATE_FAILED].freeze

  TYPE_REGULAR = "regular".freeze
  TYPE_HTTPS = "https".freeze

  DEFAULT_HTTPS_PORT = 443

  belongs_to :app
  belongs_to :user
  belongs_to :app_series
  belongs_to :analysis

  has_and_belongs_to_many :input_files, join_table: "job_inputs", class_name: "UserFile"
  has_many :output_files, as: :parent, class_name: "UserFile"

  has_many :attachments, as: :item, dependent: :destroy
  has_many :notes, through: :attachments

  has_one :submission

  store :describe, coder: JSON
  store :run_data, accessors: %i(run_inputs run_outputs run_instance_type), coder: JSON
  store :provenance, coder: JSON

  acts_as_commentable
  acts_as_votable

  scope :done, -> { where(state: STATE_DONE) }
  scope :terminal, -> { where(state: TERMINAL_STATES) }

  enum entity_type: {
    TYPE_REGULAR => 0,
    TYPE_HTTPS => 1,
  }

  delegate :input_spec, :output_spec, to: :app, allow_nil: true

  attr_accessor :current_user

  def to_param
    uid
  end

  def title
    name
  end

  def klass
    "job"
  end

  def resolved_instance_type
    run_instance_type || app.instance_type
  end

  def describe_fields
    %w(title)
  end

  def terminal?
    TERMINAL_STATES.include?(state)
  end

  def done?
    state == STATE_DONE
  end

  def running?
    state == STATE_RUNNING
  end

  def failed?
    state == STATE_FAILED
  end

  def failure_reason
    return "" if !failed? || !describe.key?("failureReason")

    describe["failureReason"]
  end

  def failure_message
    return "" if !failed? || !describe.key?("failureMessage")

    describe["failureMessage"]
  end

  def runtime
    return 0 if !describe.key?("startedRunning") || !describe.key?("stoppedRunning")

    (describe["stoppedRunning"] - describe["startedRunning"]) / 1000
  end

  def energy
    return nil unless describe.key?("totalPrice")

    (describe["totalPrice"] * 100).to_i / 100.0
  end

  def energy_string
    ("$#{energy}" || "TBD").to_s
  end

  def https_job_external_url
    return unless https?

    https_port = describe.dig(:runInput, :port) || DEFAULT_HTTPS_PORT
    describe.dig(:httpsApp, :dns, :url).chomp("/") + ":#{https_port}"
  end

  def update_provenance!
    Auditor.suppress do
      new_value = { dxid => { app_dxid: app.dxid, app_id: app.id, inputs: run_inputs } }

      # TODO: USE SCOPE OF USER_FILE MODEL!
      input_files.where(parent_type: "Job").find_each do |file|
        parent_job = file.parent
        new_value.merge!(parent_job.provenance)
        new_value[file.dxid] = parent_job.dxid
      end

      update_attribute(:provenance, new_value)
    end
  end

  def publishable_by?(context, scope_to_publish_to = SCOPE_PUBLIC)
    super && terminal?
  end

  def publishable_by_user?(user)
    core_publishable_by_user?(user) && terminal?
  end

  def from_submission?
    submission.present?
  end

  def output_data
    IOCollection.build_outputs(self)
  end

  def input_data
    IOCollection.build_inputs(self)
  end

  def log_unaccessible?(context)
    scope == SCOPE_PUBLIC && user_id != context.user_id
  end
end

# == Schema Information
#
# Table name: jobs
#
#  id            :integer          not null, primary key
#  dxid          :string
#  app_id        :integer
#  project       :string
#  run_data      :text
#  describe      :text
#  provenance    :text
#  state         :string
#  name          :string
#  user_id       :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  app_series_id :integer
#  scope         :string
#  analysis_id   :integer
#

class Job < ActiveRecord::Base
  include Permissions

  INSTANCE_TYPES = {
    "baseline-2" => "mem1_ssd1_x2",
    "baseline-4" => "mem1_ssd1_x4",
    "baseline-8" => "mem1_ssd1_x8",
    "baseline-16" => "mem1_ssd1_x16",
    "baseline-32" => "mem1_ssd1_x32",
    "himem-2" => "mem3_ssd1_x2",
    "himem-4" => "mem3_ssd1_x4",
    "himem-8" => "mem3_ssd1_x8",
    "himem-16" => "mem3_ssd1_x16",
    "himem-32" => "mem3_ssd1_x32",
    "hidisk-2" => "mem1_ssd2_x2",
    "hidisk-4" => "mem1_ssd2_x4",
    "hidisk-8" => "mem1_ssd2_x8",
    "hidisk-16" => "mem1_ssd2_x16",
    "hidisk-36" => "mem1_ssd2_x36"
  }

  STATE_DONE = "done"
  STATE_TERMINATED = "terminated"
  STATE_FAILED = "failed"
  TERMINAL_STATES = [STATE_TERMINATED, STATE_DONE, STATE_FAILED]

  belongs_to :app
  belongs_to :user
  belongs_to :app_series
  belongs_to :analysis

  has_and_belongs_to_many :input_files, {join_table: "job_inputs", class_name: "UserFile"}
  has_many :output_files, as: :parent, class_name: "UserFile"

  has_many :notes, {through: :attachments}
  has_many :attachments, {as: :item, dependent: :destroy}

  has_one :submission

  store :describe, {coder: JSON}
  store :run_data, {accessors: [ :run_inputs, :run_outputs, :run_instance_type ], coder: JSON}
  store :provenance, {coder: JSON}

  acts_as_commentable
  acts_as_taggable
  acts_as_votable

  scope :done, -> { where(state: STATE_DONE) }
  scope :terminal, -> { where(state: [TERMINAL_STATES]) }

  def uid
    dxid
  end

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
    ["title"]
  end

  def terminal?
    TERMINAL_STATES.include?(state)
  end

  def done?
    state == "done"
  end

  def failed?
    state == "failed"
  end

  def failure_message
    if failed? && describe.has_key?("failureMessage")
      describe["failureMessage"]
    else
      ""
    end
  end

  def runtime
    if describe.has_key?("startedRunning") && describe.has_key?("stoppedRunning")
      (describe["stoppedRunning"] - describe["startedRunning"]) / 1000
    else
      0
    end
  end

  def energy
    if describe.has_key?("totalPrice")
      ((describe["totalPrice"] * 400 + 5).to_i / 5.0).to_i * 5
    else
      nil
    end
  end

  def energy_string
    (energy || "TBD").to_s
  end

  def input_spec
    app.input_spec
  end

  def output_spec
    app.output_spec
  end

  def update_provenance!
    new_value = { dxid => { app_dxid: app.dxid, app_id: app.id, inputs: run_inputs }}

    # TODO: USE SCOPE OF USER_FILE MODEL!
    input_files.where(parent_type: "Job").find_each do |file|
      parent_job = file.parent
      new_value.merge!(parent_job.provenance)
      new_value[file.dxid] = parent_job.dxid
    end

    update_attribute(:provenance, new_value)
  end

  def publishable_by?(context, scope_to_publish_to = "public")
    super && terminal?
  end

  def publishable_by_user?(user, scope_to_publish_to = "public")
    super && terminal?
  end

  def publish_by_user(user, scope = "public")
    update!(scope: scope) if publishable_by_user?(user, scope)
  end

  def from_submission?
    submission.present?
  end

  def self.publish(jobs, context, scope)
    count = 0
    jobs.uniq.each do |job|
      job.with_lock do
        if job.publishable_by?(context, scope)
          job.update!(scope: scope)
          count += 1
        end
      end
    end

    return count
  end

  def output_data
    IOCollection.build(output_spec, run_outputs)
  end

  def input_data
    IOCollection.build(input_spec, run_inputs)
  end
end

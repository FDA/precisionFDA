# == Schema Information
#
# Table name: analyses
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  dxid        :string(255)
#  user_id     :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  workflow_id :integer
#  batch_id    :string(255)
#

class Analysis < ApplicationRecord
  include Auditor
  include Permissions
  extend ApplicationHelper

  belongs_to :workflow
  has_many :jobs, dependent: :destroy

  belongs_to :user
  has_many :batch_items, class_name: "Analysis", foreign_key: :batch_id, primary_key: :batch_id

  def batch_jobs
    batch_items.map do |i|
      i.jobs
    end
  end

  def self.editable_by(context)
    return none unless context.logged_in?

    where(user: context.user)
  end

  def self.batch_hash(analyses)
    batches = {}
    analyses.includes(batch_items: [:workflow, jobs: :app]).each do |analysis|
      batches[analysis.id] =
          analysis.batch_items.map do |batch_item|
            jobs =
            {
                 id: batch_item.jobs.first.id,
                 state: jobs_state(batch_item.jobs),
                 uid: batch_item.jobs.first.uid,
                 execution: batch_item.workflow.name,
                 workflow_uid: batch_item.workflow.uid,
                 app_uid: batch_item.jobs.first.app.uid,
                 app_title: batch_item.jobs.first.app.title,
                 batch_id: batch_item.batch_id,
                 duration: humanize_seconds(batch_item.analysis_duration),
                 created: batch_item.jobs.first.created_at.to_s(:db),
                jobs: batch_item.jobs.map do |job|
              {
                 id: job.id,
                 state: job.state,
                 uid: job.uid,
                 execution: job.name,
                 app_uid: job.app.uid,
                 app_title: job.app.title,
                 batch_id: batch_item.batch_id,
                 duration: humanize_seconds(job.runtime),
                 created: job.created_at.to_s(:db)
              }
            end
            }
            jobs
          end
    end
    batches
  end

  FSTATES = ['terminated', 'failed']
  def self.jobs_state(jobs)
    jobs.map(&:state).reduce{|v, acc| acc = FSTATES.include?(v) ? v : acc; FSTATES.include?(v) ? v : acc}
  end

  def self.job_hash(analyses, options={})
    analyses.includes(:workflow, :batch_items, jobs: :app).reduce({}) do |acc, analysis|
      formatted_jobs = analysis.jobs.to_a.flatten.map do |job|
        formatted_job = {
          id: job.id,
          state: job.state,
          uid: job.uid,
          execution: job.name,
          app_uid: job.app.uid,
          app_title: job.app.title,
          batch_id: analysis.batch_id,
          batch_children: options[:stop].nil? && analysis.batch_id.present? ? self.job_hash(analysis.batch_items, options.merge({stop: true})) : nil,
          duration: humanize_seconds(job.runtime),
          created: job.created_at.to_s(:db)
        }
        if job.public?
          formatted_job[:icon] = "fa-globe"
        elsif job.in_space?
          formatted_job[:icon] = "fa-object-group"
        elsif job.private?
          formatted_job[:icon] = "fa-lock"
        end
        if options[:workflow_details]
          formatted_job[:workflow_dxid] = analysis.workflow.dxid
          formatted_job[:workflow_uid] = analysis.workflow.uid
          formatted_job[:workflow_title] = analysis.workflow.title
        end

        formatted_job
      end
      acc.merge(analysis.id => formatted_jobs)
    end
  end

  def can_terminate?
    batch_id.present? ? Analysis.check_jobs_state(batch_id) : false
  end

  def self.check_jobs_state(batch_id)
    where(batch_id: batch_id).each do |b|
      b.jobs.each do |job|
        return true unless (Job::TERMINAL_STATES.include?(job.state) || Job::STATE_TERMINATING == job.state)
      end
    end
    false
  end

  def all_state
    analysis_state = ""
    last_analysis = ""

    if batch_id.nil?
      analyses = [self]
    else
      analyses = batch_items
    end
    full_state = ""
    finished = false
    analyses.each do |analysis|

      finished = analysis.jobs.all?{|v| Job::TERMINAL_STATES.include?(v)} if finished
      analysis.jobs.each do |job|
        if job.state == 'terminated' && analysis_state != 'failed'
          analysis_state = job.state
        elsif job.state == 'failed'
          analysis_state = job.state
        else
          analysis_state = job.state
        end
      end
        if analysis_state == 'terminated' && full_state != 'failed'
          full_state = analysis_state
        elsif analysis_state == 'failed'
          full_state = analysis_state
        else
          full_state = analysis_state
        end
      last_analysis = analysis_state
      analysis_state = ""
    end

    finished ? full_state : last_analysis
  end

  def output_files
    jobs.reduce([]) do |jobs, job|
      jobs.unshift(*job.output_files)
    end
  end

  def analysis_duration
    jobs.reduce(0) { |sum, job| job.runtime.nil? ? sum : sum + job.runtime }
  end

  def duration
    return batch_items.reduce(0) {|sum, analysis| sum + analysis.analysis_duration} if batch_id.present?
    analysis_duration
  end
end

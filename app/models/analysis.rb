# == Schema Information
#
# Table name: analyses
#
#  id          :integer          not null, primary key
#  name        :string
#  dxid        :string
#  user_id     :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  workflow_id :integer
#

class Analysis < ActiveRecord::Base
  include Auditor
  include Permissions
  extend ApplicationHelper

  belongs_to :workflow
  has_many :jobs
  belongs_to :user
  has_many :batch_items, class_name: Analysis, foreign_key: :batch_id, primary_key: :batch_id

  def batch_jobs
    batch_items.map do |i|
      i.jobs
    end
  end

  def self.can_be_in_space?
    false
  end

  def self.batch_hash(analyses)
    batches = {}
    analyses.each do |analysis|
      batches[analysis.id] =
          analysis.batch_items.map do |batch_item|
            jobs =
            {
                 id: batch_item.jobs.first.id,
                 state: batch_item.jobs.first.state,
                 uid: batch_item.jobs.first.uid,
                 execution: batch_item.workflow.name,
                 workflow_uid: batch_item.workflow.uid,
                 app_uid: batch_item.jobs.first.app.uid,
                 app_title: batch_item.jobs.first.app.title,
                 batch_id: batch_item.batch_id,
                 duration: humanizeSeconds(batch_item.analysis_duration),
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
                 duration: humanizeSeconds(job.runtime),
                 created: job.created_at.to_s(:db)
              }
            end
            }
            jobs
          end
    end
    batches
  end

  def self.job_hash(analyses, options={})
    analyses.reduce({}) do |acc, analysis|
      formatted_jobs = analysis.jobs.flatten.map do |job|
        formatted_job = {
          id: job.id,
          state: job.state,
          uid: job.uid,
          execution: job.name,
          app_uid: job.app.uid,
          app_title: job.app.title,
          batch_id: analysis.batch_id,
          batch_children: options[:stop].nil? && analysis.batch_id.present? ? self.job_hash(analysis.batch_items, options.merge({stop: true})) : nil,
          duration: humanizeSeconds(job.runtime),
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
    state = 'done'
    important_state = ""
    analyses = []
    if batch_id.nil?
      analyses = [self]
    else
      analyses = batch_items
    end
    analyses.each do |analysis|
      analysis.jobs.each do |job|
        if job.state != 'done'
          state = job.state
          if Job::TERMINAL_STATES.include?(job.state)
            if job.state == 'terminated' && important_state != 'failed'
              important_state = job.state
            end

            if job.state == 'failed'
              important_state = job.state
            end
          end
        end
      end
    end
    state != "done" && Job::TERMINAL_STATES.include?(important_state) && Job::TERMINAL_STATES.include?(state) ? important_state : state
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

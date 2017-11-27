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
  include Permissions
  extend ApplicationHelper

  belongs_to :workflow
  has_many :jobs
  belongs_to :user

  def self.job_hash(analyses, options={})
    analyses.reduce({}) do |acc, analysis|
      formatted_jobs = analysis.jobs.map do |job|
        formatted_job = {
          id: job.id,
          state: job.state,
          dxid: job.dxid,
          execution: job.name,
          app_dxid: job.app.dxid,
          app_title: job.app.title,
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
          formatted_job[:workflow_title] = analysis.workflow.title
        end
        formatted_job
      end
      acc.merge(analysis.id => formatted_jobs)
    end
  end

  def all_state
    state = 'done'
    jobs.each do |job|
      if job.state != 'done'
        state = job.state
      end
    end
    state
  end

  def duration
    jobs.reduce(0) { |sum, job| job.runtime.nil? ? sum : sum + job.runtime }
  end
end

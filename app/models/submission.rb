# == Schema Information
#
# Table name: submissions
#
#  id            :integer          not null, primary key
#  challenge_id  :integer
#  job_id        :integer
#  user_id       :integer
#  desc          :text
#  meta          :text
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class Submission < ActiveRecord::Base
  include Auditor

  belongs_to :user
  belongs_to :job
  belongs_to :challenge

  store :meta, accessors: [:_inputs], coder: JSON

  attr_accessor :inputs

  def name
    if job.present?
      job.name
    else
      ""
    end
  end

  def uid
    "submission-#{id}"
  end

  def klass
    "submission"
  end

  def self.accessible_by_public
    Submission.joins(:job).where(jobs: {state: "done"})
  end

  def self.editable_by(context)
    if !context.logged_in?
      none
    else
      raise unless context.user_id.present? && context.user.present?
      where(user_id: context.user.id)
    end
  end
end

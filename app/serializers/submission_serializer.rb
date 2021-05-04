# Submission serializer.
class SubmissionSerializer < ApplicationSerializer
  attributes(
    :id,
    :name,
    :challenge_id,
    :desc,
    :created_at,
    :updated_at,
    :user,
    :inputs,
    :job_state,
    :job_name,
    :job_input_files,
    :user_can_access_space,
  )

  delegate :user, to: :object

  def inputs
    object._inputs
  end

  def created_at
    object.created_at.to_s(:human)
  end

  def updated_at
    object.updated_at.to_s(:human)
  end

  def job_state
    object.job.state
  end

  def job_name
    object.job.name
  end

  def job_input_files
    object.job.input_files
  end

  def user_can_access_space
    object.challenge.space.accessible_by_user?(current_user)
  end
end

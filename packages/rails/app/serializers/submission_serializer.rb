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
    :run_input_data,
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

  def run_input_data
    input_data = []
    object.job.input_data.each do |item|
      input_data << form_item_run_data(item)
    end
    input_data
  end

  def form_item_run_data(item)
    item_run_data = {}
    item_run_data.merge!(name: item.name)

    if item.file?
      if item.file.present?
        item_run_data.merge!(file_name: item.file.name)
        item_run_data.merge!(file_uid: item.file.uid)
      else
        item_run_data.merge!(value: item.value)
      end
    else
      item_run_data.merge!(value: item.value)
    end

    item_run_data
  end

  def user_can_access_space
    return false unless object.challenge.space

    object.challenge.space.accessible_by_user?(current_user)
  end
end

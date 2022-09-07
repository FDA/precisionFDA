# Job concern.
module JobsConcern
  # Finds a job by uid, accessible by current user.
  # @param id [Integer]
  # @return [job] A Job Object if it is accessible by user.
  #   raise ApiError if not.
  def find_job
    @job = Job.accessible_by(@context).find_by(uid: unsafe_params[:id])

    raise ApiError, I18n.t("job_not_accessible") if @job.nil?

    @job
  end

  # Refresh state of single job
  def sync_job!
    return if @job.terminal?

    if @job.from_submission?
      Job.sync_challenge_job!(@job.id)
    else
      Job.sync_job!(@context, @job.id)
    end
  end

  # Refresh state of jobs, if needed
  def sync_jobs(jobs)
    Job.sync_jobs!(@context, jobs)
  end
end

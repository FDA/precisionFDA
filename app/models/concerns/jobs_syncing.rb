# Contains jobs syncing methods.
# rubocop:todo Metrics/ModuleLength
module JobsSyncing
  extend ActiveSupport::Concern

  # Class methods.
  module ClassMethods
    def sync_challenge_job!(job_id)
      user = User.challenge_bot
      job = user.jobs.find(job_id) # Re-check job id

      return if job.terminal? || job.https?

      api = DIContainer.resolve("api.challenge_bot")

      result = api.system_find_jobs(
        includeSubjobs: false,
        id: [job.dxid],
        project: user.private_files_project,
        parentJob: nil,
        parentAnalysis: nil,
        describe: true,
      )["results"].first

      sync_job_state(result, job, user, api)
    end

    def sync_job!(context, job_id)
      return if context.guest?

      job = Job.accessible_by(context).find(job_id) # Re-check job id
      return if job.terminal? || job.https?

      user = context.user
      api = DIContainer.resolve("api.user")

      result = api.system_find_jobs(
        includeSubjobs: false,
        id: [job.dxid],
        project:  job.project || user.private_files_project,
        parentJob: nil,
        parentAnalysis: job.analysis.try(:dxid),
        describe: true,
      )["results"].first

      return if result.blank?

      sync_job_state(result, job, user, api)
    end

    def sync_jobs!(context, jobs = Job.includes(:analysis), project = nil)
      return if context.guest?

      logger.debug("syncing jobs with context #{context.inspect}")
      user = context.user
      api = DIContainer.resolve("api.user")

      # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
      jobs.regular.where(user_id: user.id).
        where.not(state: Job::TERMINAL_STATES).
        limit(SYNC_JOBS_LIMIT).
        each_slice(1000) do |jobs_batch|
        jobs_hash = jobs_batch.map { |job| [job.dxid, job] }.to_h

        jobs_hash.each_key do |job_dxid|
          job_project = project || Job.find_by(dxid: job_dxid).project

          response = api.system_find_jobs(
            includeSubjobs: false,
            id: [job_dxid],
            project: job_project || user.private_files_project,
            parentJob: nil,
            describe: true,
          )

          response["results"].each do |result|
            next if result.blank?

            sync_job_state(result, jobs_hash[result["id"]], user, api)
          end
        end
      end
    end

    def sync_challenge_jobs!
      user = User.challenge_bot
      api = DIContainer.resolve("api.challenge_bot")

      # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
      Job.regular.where(user_id: user.id).
        where.not(state: Job::TERMINAL_STATES).all.each_slice(1000) do |jobs|
        jobs_hash = jobs.map { |job| [job.dxid, job] }.to_h

        api.system_find_jobs(
          includeSubjobs: false,
          id: jobs_hash.keys,
          project: CHALLENGE_BOT_PRIVATE_FILES_PROJECT,
          parentJob: nil,
          parentAnalysis: nil,
          describe: true,
        )["results"].each do |result|
          sync_job_state(result, jobs_hash[result["id"]], user, api)
        end
      end
    end

    # rubocop:todo Metrics/MethodLength
    def sync_job_state(result, job, user, api)
      logger.debug("syncing state #{result.inspect} for job id #{job.uid} by user #{user.dxuser}")
      state = result["describe"]["state"]
      # Only do anything if local job state is stale
      return if state == job.state

      if state == Job::STATE_DONE
        # Use serialization to deep copy result since output will be modified
        output = JSON.parse(result["describe"]["output"].to_json)
        output_file_ids = []
        output_file_cache = []
        output.each_key do |key|
          # TODO: handle arrays later
          raise if output[key].is_a?(Array)
          next unless output[key].is_a?(Hash)
          raise unless output[key].key?("$dnanexus_link")

          output_file_id = output[key]["$dnanexus_link"]
          output_file_ids << output_file_id
          output[key] = output_file_id
        end
        output_file_ids.uniq!
        output_file_ids.each_slice(1000) do |slice_of_file_ids|
          api.system_describe_data_objects(slice_of_file_ids)["results"].
            each_with_index do |api_result, i|
            # Push avoids creating a new array as opposed to +/+=
            output_file_cache.push(
              dxid: slice_of_file_ids[i],
              project: job.project || user.private_files_project,
              name: api_result["describe"]["name"],
              state: "closed",
              description: "",
              user_id: user.id,
              scope: job.scope || "private",
              file_size: api_result["describe"]["size"],
              parent: job,
              parent_folder_id: job.local_folder_id,
            )
          end
        end

        # Job is done and outputs need to be created
        Job.transaction do
          job.reload
          if state != job.state
            output_file_cache.each do |output_file|
              user_file = UserFile.create!(output_file)
              if user_file.scope =~ /^space-(\d+)$/
                user_file.update(scoped_parent_folder_id: user_file.parent_folder_id)
              end
              Event::FileCreated.create_for(user_file, user)
            end
            job.run_outputs = output
            job.state = state
            job.describe = result["describe"]
            job.save!
            Event::JobClosed.create_for(job, user)
          end
        end

        if job.scope =~ /^space-(\d+)$/
          SpaceEventService.call(Regexp.last_match(1).to_i, user.id, nil, job, :job_completed)
        end

        send_job_email(job.id, NotificationPreference.email_types[:notification_job_done])
      else
        if state == Job::STATE_FAILED
          # Job failed, so we need to log this
          logger.info "Job #{job.id} failed: " \
                      "failureReason: #{result['describe']['failureReason']}, " \
                      "failureMessage: #{result['describe']['failureMessage']}"

          send_job_email(job.id, NotificationPreference.email_types[:notification_job_failed])
        end

        # Job state changed but not done (no outputs)
        Job.transaction do
          job.reload
          if state != job.state
            job.state = state
            job.describe = result["describe"]
            job.save!
            Event::JobClosed.create_for(job, user)
          end
        end
      end
    end
    # rubocop:enable Metrics/MethodLength

    def send_job_email(job_id, email_type_id)
      client = DIContainer.resolve("https_apps_client")
      client.email_send(email_type_id, { jobId: job_id })
    end
  end

  included do
    private_class_method :sync_job_state
    private_class_method :send_job_email
  end
end
# rubocop:enable Metrics/ModuleLength

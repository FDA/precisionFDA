module PublishService
  # Job publishing service.
  class JobPublisher
    def initialize(context)
      @context = context
      @user = context.user
      @api = context.api
    end

    # Publishes (if possible) provided jobs into specified scope.
    # @param jobs [Array[Job]] Jobs to publish.
    # @param scope [String] Scope to publish jobs to.
    # @return [Integer] Number of published jobs.
    def publish(jobs, scope)
      count = 0

      jobs.each do |job|
        job.with_lock do
          next unless job.publishable_by?(@context, scope)

          update_job!(job, scope)
          count += 1
        end
      end

      count
    end

    private

    # Updates job's scope and possibly creates #SpaceEvent if job is being published to a space.
    # @param job [Job] Publishing job.
    # @param scope [String] Scope the job is being published to.
    def update_job!(job, scope)
      job.update!(scope: scope)

      begin
        space = Space.from_scope(scope)
        create_space_event(job, space)
      rescue NotASpaceError
        return
      end
    end

    # Creates :job_added #SpaceEvent for published job.
    # @param job [Job] Published job.
    # @param space [Space] Space the job was published to.
    # @return @see SpaceEventService::call
    def create_space_event(job, space)
      SpaceEventService.call(space.id, @user.id, nil, job, :job_added)
    end
  end
end

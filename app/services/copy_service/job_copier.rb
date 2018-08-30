class CopyService
  class JobCopier

    def initialize(api:, user:, file_copier: nil)
      @api = api
      @user = user
      @file_copier = file_copier || FileCopier.new(api: api, user: user)
    end

    def copy(job, scope)
      new_job = job.dup
      new_job.scope = scope
      new_job.save!

      copy_dependencies(new_job, job, scope)
      new_job
    end

    private

    attr_reader :api, :user, :file_copier

    def copy_dependencies(new_job, job, scope)
      copy_files(new_job, job, scope)
      copy_app(new_job, job, scope)
    end

    def copy_files(new_job, job, scope)
    new_job.input_files = file_copier.copy(job.input_files, scope)
      new_job.output_files = file_copier.copy(job.output_files, scope)
      new_job.save!
    end

    def copy_app(new_job, job, scope)

    end

  end
end

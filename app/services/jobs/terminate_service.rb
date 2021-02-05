module Jobs
  # Jobs terminate service
  # https://documentation.dnanexus.com/developer/api/running-analyses
  # /applets-and-entry-points#api-method-job-xxxx-terminate
  class TerminateService < ::BaseTransportService
    SUCCESS_MESSAGE = "Request(s) to terminate executions has been successfully sent. ".freeze

    def call
      terminate

      self
    end

    def message
      service_message = SUCCESS_MESSAGE
      service_message = response[:errors].inspect if response[:errors].present?

      service_message
    end

    private

    def terminate
      Array.wrap(params).map { |uid| process uid }
      set_status
    end

    def process(record)
      job = Job.where(user_id: context.user_id).find_by!(uid: record)
      raise JobInTerminalStateError, job.dxid if job.terminal?

      response[:data] << DNAnexusAPI.new(context.token).job_terminate(job.dxid)
    rescue ActiveRecord::RecordNotFound, JobInTerminalStateError => e
      response[:errors] << e.message
    end

    def set_status
      @status = STATUS[:success] if response[:errors].empty?
    end
  end
end

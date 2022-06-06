module Jobs
  # Jobs sync files service to trigger syncing of files in an https job's dx project to pFDA
  class SyncFilesService < ::BaseTransportService
    SUCCESS_MESSAGE = "Workstation files will begin syncing momentarily. Depending on "\
                      "the number of folders and files this may take 10-20 minutes.".freeze

    def call
      sync_files

      self
    end

    def message
      service_message = SUCCESS_MESSAGE
      service_message = response[:errors].inspect.delete('[""]') if response[:errors].present?

      service_message
    end

    private

    def sync_files
      process params
      set_status
    end

    def process(job_dxid)
      api = DIContainer.resolve("https_apps_client")
      response[:data] << api.job_sync_files(job_dxid)
    rescue HttpsAppsClient::Error => e
      response[:errors] << e.message
    end

    def set_status
      @status = STATUS[:success] if response[:errors].empty?
    end
  end
end

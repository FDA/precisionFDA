# Removes a list of files from the platform
class RemoveFileWorker < ApplicationWorker
  sidekiq_retries_exhausted do |job, _ex|
    file_id = job["args"].first
    files = Node.where(id: file_id)

    files.update(state: UserFile::STATE_CLOSED)

    Rails.logger.error "[#{job['class']}] Failed to remove the file [id=#{file_id}]: " \
                       "#{job['error_message']}"
  end

  def perform(file_id, session_auth_params)
    context = Context.build(session_auth_params)

    service = FolderService.new(context)
    files = Node.where(id: file_id)

    res = service.remove(files)

    raise res.value[:message] if res.failure?
  end
end

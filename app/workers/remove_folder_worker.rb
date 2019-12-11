# Removes a list of files and folders
class RemoveFolderWorker < ApplicationWorker
  sidekiq_retries_exhausted do |job, _ex|
    node_ids = job["args"].first

    query = { id: node_ids, state: Node::STATE_REMOVING }

    files = UserFile.where(query)
    folders = Folder.where(query)

    files.update(state: UserFile::STATE_CLOSED)
    folders.update(state: nil)

    Rails.logger.error "[#{job['class']}] Failed to remove files and folders " \
                       "#{(files + folders).pluck(:name).join(', ')}: " \
                       "#{job['error_message']}"
  end

  def perform(node_ids, session_auth_params)
    context = Context.build(session_auth_params)

    service = FolderService.new(context)
    nodes = Node.where(id: node_ids)

    res = service.remove(nodes)

    raise res.value[:message] if res.failure?
  end
end

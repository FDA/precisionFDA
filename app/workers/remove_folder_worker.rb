# Removes a list of files from the platform
class RemoveFolderWorker < ApplicationWorker
  def perform(file_ids, session_auth_params)
    context = Context.build(session_auth_params)

    service = FolderService.new(context)
    files = Node.editable_by(context).where(id: file_ids)

    service.remove(files)
  end
end

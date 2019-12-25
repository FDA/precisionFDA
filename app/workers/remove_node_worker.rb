# Removes a list of files and folders
class RemoveNodeWorker < ApplicationWorker
  sidekiq_retries_exhausted do |job, _ex|
    failed_nodes = rollback_nodes_state(job["args"].first)
    context = Context.build(job["args"].last)
    space = failed_nodes[:files].first&.space || failed_nodes[:folders].first&.space

    notify_user(
      context.user.email,
      space,
      job["error_message"],
    )
  end

  class << self
    # Rollback the states of failed files and folders to a normal.
    # @param node_ids [Array<Integer>] Node IDs.
    # @return [Hash] Files and folders that are failed to remove.
    #   and folders that was not removed due to an error.
    def rollback_nodes_state(node_ids)
      query = { id: node_ids, state: Node::STATE_REMOVING }

      files = UserFile.where(query)
      folders = Folder.where(query)

      Node.transaction do
        files.update(state: UserFile::STATE_CLOSED)

        folders.find_each do |folder|
          folder.update!(state: nil)

          folder.all_children.each do |node|
            state = node.is_a?(UserFile) ? UserFile::STATE_CLOSED : nil
            node.update!(state: state)
          end
        end
      end

      { files: files, folders: folders }
    end

    # Sends an email to user about an error during removing.
    # @param email [String] User's email.
    # @param space [Space] Space.
    # @param error_message [String] Error message.
    #   and folders that was not removed due to an error.
    def notify_user(email, space, error_message)
      WorkerMailer.remove_node_worker_email(
        email,
        space,
        error_message,
      ).deliver_now
    end
  end

  # Removes files and folders.
  # @param node_ids [Array<Integer>] Node IDs.
  # @param session_auth_params [Hash] User session params.
  # @raise [RuntimeError] If there was any error during a removing.
  def perform(node_ids, session_auth_params)
    context = Context.build(session_auth_params)

    service = FolderService.new(context)
    nodes = Node.where(id: node_ids)

    res = service.remove(nodes)

    raise res.value[:message] if res.failure?
  end
end

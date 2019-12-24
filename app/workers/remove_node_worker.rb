# Removes a list of files and folders
class RemoveNodeWorker < ApplicationWorker
  sidekiq_retries_exhausted do |job, _ex|
    nodes = rollback_nodes_state(job["args"].first)
    context = Context.build(job["args"].last)

    notify_user(
      context.user.email,
      job["error_message"],
      nodes,
    )
  end

  class << self
    # Rollback the states of failed files and folders to a normal.
    # @param node_ids [Array<Integer>] Node IDs.
    # @return [Array<UserFile::ActiveRecord_Relation, Folder::ActiveRecord_Relation>] Files
    #   and folders that was not removed due to an error.
    def rollback_nodes_state(node_ids)
      query = { id: node_ids, state: Node::STATE_REMOVING }

      files = UserFile.where(query)
      folders = Folder.where(query)

      files.update(state: UserFile::STATE_CLOSED)

      folders.find_each do |folder|
        folder.update(state: nil)

        folder.all_children.each do |node|
          state = node.is_a?(UserFile) ? UserFile::STATE_CLOSED : nil
          node.update(state: state)
        end
      end

      [files, folders]
    end

    # Sends an email to user about an error during removing.
    # @param email [String] User's email.
    # @param error_message [String] Error message.
    # @param nodes [Array<UserFile::ActiveRecord_Relation, Folder::ActiveRecord_Relation>] Files
    #   and folders that was not removed due to an error.
    def notify_user(email, error_message, nodes)
      files, folders = nodes

      space = files.first&.scope || folders.first&.scope

      files = files.pluck(:name)
      folders = folders.pluck(:name)

      subject = "An error occurred during the removing of files in space '#{space}'"

      message = "#{subject.dup}: #{error_message}."
      message << "\nFailed to remove the files: #{files.join(', ')}." if files.present?
      message << "\nFailed to remove the folders: #{folders.join(', ')}." if folders.present?

      WorkerMailer.remove_node_worker_email(
        email,
        space,
        message,
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

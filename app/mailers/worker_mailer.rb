class WorkerMailer < ApplicationMailer
  helper :client_url

  def node_copy_email(email, copies, scope)
    not_copied_items = copies.reject(&:copied).map(&:object).group_by(&:class)
    @not_copied_folders = not_copied_items[Folder]
    @not_copied_files = Array(not_copied_items[UserFile]) + Array(not_copied_items[Asset])

    space = Space.valid_scope?(scope) && Space.find(Space.scope_id(scope))
    @destination = space.try(:title) || "#{scope} area"

    @subject = "Some items haven't been copied to #{@destination}"

    mail to: email, subject: @subject
  end

  def remove_node_worker_email(email, space, error_message)
    @space = space
    @error_message = error_message

    mail to: email,
         subject: "An error occurred during the removing of files in space '#{space.title}'."
  end

  def alert_email(email, message, subject)
    @message = message
    @subject = subject

    mail to: email, subject: subject
  end
end

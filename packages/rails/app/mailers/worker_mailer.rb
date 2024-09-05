class WorkerMailer < ApplicationMailer
  helper :client_url

  def node_copy_email(email, copy_ids, scope)
    copies = CopyService::Copies.where(id: copy_ids)
    not_copied_items = copies.reject(&:copied).map(&:object).group_by(&:class)
    @not_copied_folders = not_copied_items[Folder]
    @not_copied_files = Array(not_copied_items[UserFile]) + Array(not_copied_items[Asset])

    space = Space.valid_scope?(scope) && Space.find(Space.scope_id(scope))
    @destination = space.try(:title) || "#{scope} area"

    @subject = "Some items haven't been copied to #{@destination}"

    mail(to: email, subject: @subject)
  end

  def alert_email(email, message, subject)
    @message = message
    @subject = subject

    mail(to: email, subject: subject)
  end
end

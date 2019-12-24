class WorkerMailer < ApplicationMailer
  def remove_node_worker_email(email, space, message)
    @subject = "An error occurred during the removing of files in space '#{space}'."
    @message = message

    mail to: email, subject: @subject
  end
end

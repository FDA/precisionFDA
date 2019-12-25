class WorkerMailer < ApplicationMailer
  def remove_node_worker_email(email, space, error_message)
    @space = space
    @error_message = error_message

    mail to: email,
         subject: "An error occurred during the removing of files in space '#{@space.title}'."
  end
end

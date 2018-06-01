class Event::SubmissionCreated < Event
  alias_attribute :submission_id, :param1

  def self.create_for(submission, user)
    create(
      submission_id: submission.id,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end
end

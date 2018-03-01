class Event::SubmissionCreated < Event

  event_attribute :submission_id, db_column: :param1

  def self.create(submission, user)
    super(
      submission_id: submission.id,
      dxuser: user.dxuser,
      org_handle: user.org.handle
    )
  end

end

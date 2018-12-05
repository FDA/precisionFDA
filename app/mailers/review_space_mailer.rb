class ReviewSpaceMailer < ApplicationMailer
  helper :application, :spaces, :path
  default  from: 'PrecisionFDA <PrecisionFDA@fda.hhs.gov>',
           reply_to: "PrecisionFDA@fda.hhs.gov"

  # @param initiator [User] User who unlocked the space
  # @param member [SpaceMembership] Subscriber
  def space_transition_email(space, initiator, receiver, action)
    @action = action
    @space = space
    @initiator = initiator
    mail to: receiver.email,
         subject: "#{initiator.full_name} #{action} the space \"#{space.title}\""
  end

  def member_email(event, receiver, action)
    @space = event.space
    @initiator = event.user
    @new_member = event.entity
    @action = action
    mail to: receiver.email,
         subject: "#{@initiator.full_name} #{action}"
  end

  def new_comment_email(comment, receiver)
    @comment = comment
    @receiver = receiver
    mail to: receiver.email,
         subject: "#{comment.user.full_name} added a comment"
  end

  def new_content_email(content, receiver)
    @content = content
    @space = content.space_object
    @receiver = receiver
    mail to: receiver.email,
         subject: "#{content.user.full_name} added a new #{content.klass} "
  end

  def inactive_space_email(space)
    @space = space
    mail to: User.review_space_admins.pluck(:email),
         subject: "Space is inactive"
  end

end

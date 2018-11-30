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

  # @param new_member [SpaceMembership] Subscriber
  # @param subscriber [SpaceMembership] Subscriber
  def member_email(space, new_member, receiver, action)
    @space = space
    @new_member = new_member
    mail to: receiver.email,
         subject: "#{new_member.user.full_name} was #{action}"
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

end

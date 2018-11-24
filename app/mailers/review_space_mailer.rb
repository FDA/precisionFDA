class ReviewSpaceMailer < ApplicationMailer
  helper :application, :spaces
  default  from: 'PrecisionFDA <PrecisionFDA@fda.hhs.gov>',
           reply_to: "PrecisionFDA@fda.hhs.gov"

  # @param unlocker [User] User who unlocked the space
  # @param member [SpaceMembership] Subscriber
  def unlock_email(space, unlocker, member)
    @space = space
    @member = member
    mail to: @member.user.email,
         subject: "#{unlocker.full_name} unlocked the space \"#{@space.title}\""
  end

end

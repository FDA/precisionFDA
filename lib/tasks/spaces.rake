module InactiveSpaceFinder

  def self.find(from_date)
    Space.shared.locked.where(inactivity_notified: false).where('updated_at < ?', from_date).select do |space|
      check_space(space, from_date)
    end
  end

  def self.check_space(space, from_date)
    return false if space.space_events.where('created_at > ?', from_date).any?

    space.confidential_spaces.where('updated_at < ?', from_date).all? do |confidential_space|
      check_space(confidential_space, from_date)
    end
  end
end

namespace :spaces do
  desc "Check inactivity on locked spaces"
  task check_inactivity: :environment do

    InactiveSpaceFinder.find(6.months.ago).each do |space|
      if User.review_space_admins.any?
        ReviewSpaceMailer.inactive_space_email(space).deliver_now!
      end
      space.update(inactivity_notified: true)
    end
  end
end

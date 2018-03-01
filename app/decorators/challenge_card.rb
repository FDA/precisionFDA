class ChallengeCard
  delegate :title, to: :challenge

  def self.by_context(challenge, context)
    new(
      challenge,
      context.logged_in? ? context.user : User.new
    )
  end

  def initialize(challenge, user)
    @challenge = challenge
    @user = user
  end

  def [](method)
    send(method)
  end

  def path
    show_challenge_path(challenge)
  end

  def results_path
    show_challenge_path(challenge, tab: :results)
  end

  def thumbnail
    challenge.card_image_url
  end

  def responses_count
    challenge.submissions.count
  end

  def followers_count
    challenge.count_user_followers
  end

  def launched
    true
  end

  def joined
    challenge.followed_by?(user) if user
  end

  def start_date
    challenge.start_at
  end

  def end_date
    challenge.end_at
  end

  def active
    challenge.active?
  end

  def ended
    challenge.over?
  end

  def results_date
    nil
  end

  def results_announced
    true
  end

  private

  attr_reader :challenge, :user

  def show_challenge_path(challenge, params = {})
    Rails.application.routes.url_helpers.show_challenge_path(challenge, params)
  end

end

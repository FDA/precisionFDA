class Challenge::State

  STATE_SETUP        = "setup"
  STATE_ACTIVE       = "active"
  STATE_COMING_SOON  = "coming_soon"
  STATE_PAUSED       = "paused"
  STATE_CLOSED       = "closed"
  STATE_ANNOUNCED    = "result_announced"
  STATE_ARCHIVED     = "archived"

  delegate :to_s, to: :state

  def initialize(challenge)
    @challenge = challenge
  end

  def setup?
    state == STATE_SETUP
  end

  def active?
    state == STATE_ACTIVE
  end

  def coming_soon?
    state == STATE_COMING_SOON
  end

  def paused?
    state == STATE_PAUSED
  end

  def closed?
    state == STATE_CLOSED
  end

  def archived?
    state == STATE_ARCHIVED
  end

  def result_announced?
    state == STATE_ANNOUNCED
  end

  private

  def state
    return STATE_SETUP     if challenge.status_setup?
    return STATE_ARCHIVED  if challenge.status_archived?
    return STATE_ANNOUNCED if challenge.status_result_announced?
    return STATE_PAUSED    if challenge.status_paused?
    return STATE_CLOSED    if challenge.over?
    return STATE_ACTIVE    if challenge.started?

    STATE_COMING_SOON
  end

  attr_reader :challenge

end

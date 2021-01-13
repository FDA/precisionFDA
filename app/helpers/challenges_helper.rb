module ChallengesHelper
  def cm(n)
    n.to_i.to_s.reverse.gsub(/...(?=.)/,'\&,').reverse
  end

  def pct(n)
    sprintf("%.2f%%", n*100.0)
  end

  def medal_badge(medal, qualifier = '', type = '', context = '')
    if medal.instance_of? String
      if type == 'large'
        raw """
            <div class='challenge-badge-qualifier'>#{qualifier}</div>
            <div class='challenge-badge-medal-name'>#{medal}</div>
            <div class='challenge-badge-context'>
              #{context}
            </div>
            <div class='text-center'>
              <span class='fa-stack fa-3x' aria-hidden='true'>
                <i class='fa fa-certificate fa-stack-2x'></i>
                <i class='fa fa-trophy fa-stack-1x fa-inverse'></i>
              </span>
            </div>
        """
      else
        raw """
          <span class='challenge-badge challenge-badge-medal'>
            <span class='fa-stack' aria-hidden='true'>
              <i class='fa fa-certificate fa-stack-2x'></i>
              <i class='fa fa-trophy fa-stack-1x fa-inverse'></i>
            </span>
            #{medal}
          </span>
        """
      end
    elsif medal == true
      raw """
        <span class='challenge-badge challenge-badge-medal'>
          <span class='fa-stack' aria-hidden='true'>
            <i class='fa fa-certificate fa-stack-2x'></i>
            <i class='fa fa-trophy fa-stack-1x fa-inverse'></i>
          </span>
        </span>
      """
    end
  end

  def recognition_badge(recognition, trim = true)
    if recognition.instance_of? String
      if recognition.include? "highest"
        raw """
          <span class='challenge-badge challenge-badge-recognition-highest'>
            <span class='fa fa-star' aria-hidden='true'></span>
            #{trim ? 'Highest' : recognition}
          </span>
        """
      elsif recognition.include? "high"
        raw """
          <span class='challenge-badge challenge-badge-recognition'>
            <span class='fa fa-star' aria-hidden='true'></span>
            #{trim ? 'High' : recognition}
          </span>
        """
      elsif recognition.include? "not-considered"
        return "Not Considered"
      elsif recognition.include? "variant"
        raw """
          <span class='challenge-badge challenge-badge-supercaller'>
            <span class='fa fa-star' aria-hidden='true'></span>
            #{trim ? 'Variant Catcher' : recognition}
          </span>
        """
      elsif recognition.include? "vaf"
        raw """
          <span class='challenge-badge challenge-badge-superplayer'>
            <span class='fa fa-star' aria-hidden='true'></span>
            #{trim ? 'VAF Spotter' : recognition}
          </span>
        """
      else
        raw """
          <span class='challenge-badge challenge-badge-recognition'>
            <span class='fa fa-star' aria-hidden='true'></span>
            #{recognition if recognition.instance_of? String}
          </span>
        """
      end
    elsif recognition == true
      raw """
        <span class='challenge-badge challenge-badge-recognition'>
          <span class='fa fa-star' aria-hidden='true'></span>
        </span>
      """
    end
  end

  # Returns a collection of users-owners of apps for selection on challenge create or edit
  # each User should be valid, i.e. to have an Org, otherwise skipped
  # @return [Array] Array<Array> of users info: user names with org name, user id
  def app_owners_for_select
    User.real.map { |u| [u.select_text, u.id] if u.org }.compact
  end

  # Returns a collection of Site admins and challenge admins
  # @return [Array<String>] dxids of Site admins and challenge admins
  def host_lead_dxusers
    User.site_admins.or(User.challenge_admins).order(:dxuser).distinct.pluck(:dxuser)
  end

  # Returns a collection of Site admins, challenge evaluators and challenge admins
  # @return [Array<String>] dxids of Site admins, challenge evaluators and challenge admins
  def guest_lead_dxusers
    User.site_admins.
      or(User.challenge_admins).
      or(User.challenge_evaluators).
      order(:dxuser).distinct.pluck(:dxuser)
  end

  # Returns a collection of challenges for selection on challenge edit page
  # @return  Array<Array> Array of challenges name + id
  def challenge_order_for_select
    Challenge.not_status(Challenge::STATUS_ARCHIVED).all.map { |ch| [ch.name, ch.id] }
  end

  def spaces_for_select(context, challenge)
    original_space = if challenge.persisted? && Space.valid_scope?(challenge.scope)
      Space.from_scope(challenge.scope)
    end

    [[Scopes::SCOPE_PUBLIC.titleize, Scopes::SCOPE_PUBLIC]] +
      Space.groups.editable_by(context).order(:name).map { |space| [space.title, space.scope] } +
      [[original_space&.title, original_space&.scope]]
  end
end

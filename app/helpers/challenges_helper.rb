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
end

module ChallengesHelper
  def cm(n)
    n.to_i.to_s.reverse.gsub(/...(?=.)/,'\&,').reverse
  end

  def pct(n)
    sprintf("%.2f%%", n*100.0)
  end

  def medal_badge(medal, qualifier = '', type = '')
    if medal.instance_of? String
      if type == 'large'
        raw """
          <div class='challenge-badge challenge-badge-medal challenge-badge-lg'>
            <div class='media'>
              <div class='media-left'>
                <span class='fa-stack fa-lg' aria-hidden='true'>
                  <i class='fa fa-certificate fa-stack-2x'></i>
                  <i class='fa fa-trophy fa-stack-1x fa-inverse'></i>
                </span>
              </div>
              <div class='media-body'>
                <div class='challenge-badge-qualifier'>#{qualifier}</div>
                <div class='challenge-badge-medal-name'>#{medal}</div>
              </div>
            </div>
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
        <span class='challenge-badge challenge-badge-medal-inverse'>
          <span class='fa-stack' aria-hidden='true'>
            <i class='fa fa-certificate fa-stack-2x'></i>
            <i class='fa fa-trophy fa-stack-1x fa-inverse'></i>
          </span>
        </span>
      """
    end
  end

  def recognition_badge(recognition, trim = true)
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
  end
end

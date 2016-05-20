module ChallengesHelper
  def cm(n)
    n.to_i.to_s.reverse.gsub(/...(?=.)/,'\&,').reverse
  end

  def pct(n)
    sprintf("%.2f%%", n*100.0)
  end

  def medal_badge(medal)
    if medal != ''
      raw """
        <div class='challenge-badge challenge-badge-medal'>
          <span class='fa-stack fa-lg'>
            <i class='fa fa-certificate fa-stack-2x'></i>
            <i class='fa fa-trophy fa-stack-1x fa-inverse'></i>
          </span>
          #{medal}
        </div>
      """
    end
  end

  def recognition_badge(recognition)
    if recognition != ''
      if recognition.include? "highest"
        raw """
          <div class='challenge-badge challenge-badge-recognition-highest'>
            <span class='fa fa-certificate'></span>
            #{recognition}
          </div>
        """
      elsif recognition.include? "not-considered"
        return "Not Considered"
      else
        raw """
          <div class='challenge-badge challenge-badge-recognition'>
            <span class='fa fa-certificate'></span>
            #{recognition}
          </div>
        """
      end
    end
  end
end

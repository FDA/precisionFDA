module DocsHelper
  def video_iframe(url)
    content_tag("iframe", nil, {width: "100%", height: "315", src: url, frameborder: 0, allowfullscreen: true})
  end
end

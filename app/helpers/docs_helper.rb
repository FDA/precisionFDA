module DocsHelper
  def video_iframe(url)
    content_tag :div, :class => "embed-container" do
      content_tag("iframe", nil, {src: url, frameborder: 0, allowfullscreen: true})
    end
  end
end

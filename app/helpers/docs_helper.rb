module DocsHelper
  def videos
    # Use "<%= video_iframe(@videos[:KEY_1][:KEY_2]...) %>" to protect against HTML injection
    @context.can_administer_site? ? t('docs.videos.common').merge(t('docs.videos.admin')) : t('docs.videos.common')
  end

  def video_iframe(url)
    content_tag :div, :class => "embed-container" do
      content_tag("iframe", nil, {src: url, frameborder: 0, allowfullscreen: true})
    end
  end
end

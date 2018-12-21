module DocsHelper
  def menu
    return t('docs.menu').except(:review_space_admin) if @context.can_administer_site?
    return t('docs.menu').except(:site_admin) if @context.review_space_admin?
    t('docs.menu').slice(:common)
  end

  def videos
    # Use "<%= video_iframe(@videos[:KEY_1][:KEY_2]...) %>" to protect against HTML injection
    return t('docs.videos.site_admin') if @context.can_administer_site?
    return t('docs.videos.review_space_admin') if @context.review_space_admin?
    t('docs.videos.common')
  end

  def video_iframe(url)
    content_tag :div, class: "embed-container" do
      content_tag("iframe", nil, src: url, frameborder: 0, allowfullscreen: true)
    end
  end
end

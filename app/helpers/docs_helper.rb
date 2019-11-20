# Helper for rendering docs.
module DocsHelper
  include ::Concerns::OrgAdmin

  # Returns menu depending on user's roles.
  # @return [Hash]
  def menu
    root = t("docs.menu")
    menu = root.slice(:common)
    menu = menu.merge(root.slice(:site_admin)) if @context.can_administer_site?
    menu = menu.merge(root.slice(:review_space_admin)) if @context.review_space_admin?
    menu = menu.merge(root.slice(:org_admin)) if @context.logged_in? && non_singular_org_admin?(@context.user)

    menu
  end

  def videos
    # Use "<%= video_iframe(@videos[:KEY_1][:KEY_2]...) %>" to protect against HTML injection
    return t("docs.videos.site_admin") if @context.can_administer_site?

    return t("docs.videos.review_space_admin") if @context.review_space_admin?

    t("docs.videos.common")
  end

  def video_iframe(url)
    content_tag :div, class: "embed-container" do
      content_tag("iframe", nil, src: url, frameborder: 0, allowfullscreen: true)
    end
  end
end

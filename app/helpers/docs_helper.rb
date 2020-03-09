# Helper for rendering docs.
module DocsHelper
  include ::Concerns::OrgAdmin

  # Returns menu depending on user's roles.
  # When a context user has no right to see the spaces docs - this section is taken away from menu
  # @return [Hash] - a pop-down menu list
  def menu
    root = t("docs.menu")

    if UserPolicy.can_see_spaces?(@context)
      menu = root.slice(:common)
    else
      dupped_root = root.deep_dup
      dupped_root[:common][:sections].delete(:spaces)
      menu = dupped_root.slice(:common)
    end

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

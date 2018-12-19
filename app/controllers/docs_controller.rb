class DocsController < ApplicationController
  skip_before_action :require_login

  def index
    redirect_to show_docs_path("intro")
  end

  def show
    section_name = params[:section] ? params[:section] : "intro"

    @sections = t('docs.common_sections').dup
    @sections.merge!(t('docs.admin_sections')) if @context.can_administer_site?
    @sections.merge!(t('docs.rsa_sections')) if @context.review_space_admin? || @context.can_administer_site?
    @sections.merge!(t('docs.video_sections'))

    @active_section = @sections.select {|key, _| key == section_name.to_sym }
    raise ActiveRecord::RecordNotFound if @active_section.nil?

    # Use "<%= video_iframe(@videos[:KEY_1][:KEY_2]...) %>" to protect against HTML injection
    @videos = {
      apps_create: {
        url: "https://www.youtube.com/embed/f-DBLB2v1sM"
      },
      apps_fork: {
        url: "https://www.youtube.com/embed/oQgJ9WD7Nkg"
      },
      apps_batch_run: {
        url: "https://www.youtube.com/embed/K9rHEef2FNs"
      },
      apps_run: {
        url: "https://www.youtube.com/embed/P90E3jgL134"
      },
      apps_export: {
        url: "https://www.youtube.com/embed/WeF9uj9QJIo"
      },
      comparisons: {
        url: "https://www.youtube.com/embed/qMd98K07U9M"
      },
      discussions: {
        url: "https://www.youtube.com/embed/KHgUe-a1v_k"
      },
      files: {
        how_to_upload_url: "https://www.youtube.com/embed/o5PmgUsWQGo",
        how_to_navigate_url: "https://www.youtube.com/embed/cj8a6I3KGvk"
      },
      intro: {
        url: "https://www.youtube.com/embed/U_vmcd93HkM"
      },
      licenses: {
        url: "https://www.youtube.com/embed/7iwwnKmalyM"
      },
      notes: {
        url: "https://www.youtube.com/embed/c2-VlRxTZLM"
      },
      publishing: {
        url: "https://www.youtube.com/embed/dsOCn1zTBOo"
      },
      challenge_workbench: {
        url: "https://www.youtube.com/embed/SKqH5OfO5G8"
      },
      site_customization: {
        url: "https://www.youtube.com/embed/j9pEb0VTf-0"
      },
      site_activity_reporting: {
        url: "https://www.youtube.com/embed/KJ-Rk-ejjBM"
      },
      workflows: {
        url: "https://www.youtube.com/embed/jGYNt1Vw_Wo"
      },
      review_spaces: {
        url: "https://www.youtube.com/embed/-YfSmb_Y-gk"
      }
    }
  end
end

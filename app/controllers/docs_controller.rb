class DocsController < ApplicationController
  skip_before_action :require_login

  def index
    redirect_to show_docs_path("intro")
  end

  def show
    section_name = params[:section] ? params[:section] : "intro"
    @sections = [
      { name: "intro", title: "Introduction"},
      { name: "files", title: "Files"},
      { name: "comparisons", title: "Comparisons"},
      { name: "apps", title: "Apps"},
      { name: "creating_apps", title: "Creating Apps"},
      { name: "notes", title: "Notes"},
      { name: "discussions", title: "Discussions"},
      { name: "tracking", title: "Tracking"},
      { name: "publishing", title: "Publishing"},
      { name: "licenses", title: "Licenses"},
      { name: "video_tutorials", title: "Video Tutorials"}
    ]
    @active_section = @sections.find {|s| s[:name] == section_name }
    raise ActiveRecord::RecordNotFound if @active_section.nil?

    # Use "<%= video_iframe(@videos[:KEY_1][:KEY_2]...) %>" to protect against HTML injection
    @videos = {
      apps_create: {
        url: "https://www.youtube.com/embed/f-DBLB2v1sM"
      },
      apps_fork: {
        url: "https://www.youtube.com/embed/oQgJ9WD7Nkg"
      },
      apps_run: {
        url: "https://www.youtube.com/embed/P90E3jgL134"
      },
      comparisons: {
        url: "https://www.youtube.com/embed/qMd98K07U9M"
      },
      discussions: {
        url: "https://www.youtube.com/embed/KHgUe-a1v_k"
      },
      files: {
        url: "https://www.youtube.com/embed/o5PmgUsWQGo"
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
      }
    }

  end
end

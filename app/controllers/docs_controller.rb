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
      { name: "licenses", title: "Licenses"}
    ]
    @active_section = @sections.find {|s| s[:name] == section_name }

    raise ActiveRecord::RecordNotFound if @active_section.nil?
  end
end

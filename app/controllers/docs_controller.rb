class DocsController < ApplicationController
  skip_before_action :require_login
  before_action :require_login_or_guest

  def index
    redirect_to show_docs_path("intro")
  end

  def show
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
    @active_section = params[:section] ? params[:section] : "intro"

    raise "Not a valid documentation section" unless @sections.map{|s| s[:name]}.include?(@active_section)
  end
end

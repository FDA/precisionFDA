# Controller responsible for rendering documentation.
class DocsController < ApplicationController
  skip_before_action :require_login

  def index
    redirect_to show_docs_path("intro")
  end

  def show
    active_section = unsafe_params[:section] ? unsafe_params[:section].to_sym : :intro
    menu = view_context.menu
    sections = menu.values.map { |value| value[:sections] }.reduce({}, :merge)
    raise ActiveRecord::RecordNotFound unless active_section.in?(sections)

    @active_section = active_section
  end
end

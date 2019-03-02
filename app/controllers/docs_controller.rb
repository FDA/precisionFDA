class DocsController < ApplicationController
  skip_before_action :require_login
  before_action :active_section, only: :show

  def index
    redirect_to show_docs_path("intro")
  end

  def show; end

  private

  def active_section
    @active_section = params[:section] ? params[:section].to_sym : :intro
    menu = view_context.menu
    sections = menu.values.map { |value| value[:sections] }
    sections = sections.reduce({}, :merge)
    raise ActiveRecord::RecordNotFound unless @active_section.to_sym.in?(sections)
  end
end

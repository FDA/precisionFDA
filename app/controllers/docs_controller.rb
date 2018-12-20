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
  end
end

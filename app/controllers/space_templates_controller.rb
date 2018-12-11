class SpaceTemplatesController < ApplicationController
  def new
    @space_template = SpaceTemplate.new
    @space_template.space_template_nodes.build

    #redirect_to edit_space_template_path(@space_template)

    @verified_spaces = Space.all_verified

    js({
           space_template_id: @space_template.id,
           spaces: @verified_spaces,
           verifiedSpacesURL: spaces_verified_space_list_path,
           space_apps_files_path: spaces_apps_and_files_path,
           unverifiedAppsURL: spaces_unverified_apps_path
       })
  end

  def edit
    @space_template = SpaceTemplate.find(params[:id])
    @verified_spaces = Space.all_verified

    js({
           space_template_id: @space_template.id,
           spaces: @verified_spaces,
           verifiedSpacesURL: spaces_verified_space_list_path,
           space_apps_files_path: spaces_apps_and_files_path,
           unverifiedAppsURL: spaces_unverified_apps_path,
           templateFiles: @space_template.space_template_nodes.where(node_type: 'Node').map(&:node),
           templateApps: @space_template.space_template_nodes.where(node_type: 'App').map(&:node),
           templateSpaces: @space_template.space_template_spaces.map(&:space)
       })
  end

  def index
    space_templates = SpaceTemplate.all_and_private(@context).order("created_at DESC")

    respond_to do |r|

      r.html do
        @templates_grid = initialize_grid( space_templates, {
            name: 'space_templates',
            order: 'created_at',
            order_direction: 'desc',
            per_page: 100
        })

        if !session[:duplicated].blank?
          js(duplicated: session[:duplicated] )
          session.delete(:duplicated)
        end

        if session[:template_created].present?
          space_template = SpaceTemplate.find(session[:template_created])
          js(template_created: space_template.name)
          session.delete(:template_created)
        end
      end

      r.json{|r| render json: space_templates }
    end
  end

  def update
    @space_template = SpaceTemplate.find(params[:id])
    @space_template.space_template_nodes.delete_all
    @space_template.space_template_spaces.delete_all
    @space_template.update!(template_params.merge({private: template_params[:private].present? ? true : false}))
    @space_template.save!

    redirect_to space_templates_path
  end

  def show
    @readonly = true
    @space_template = SpaceTemplate.find(params[:id])
    @verified_spaces = Space.all_verified

    js({
           space_template_id: @space_template.id,
           spaces: @verified_spaces,
           verifiedSpacesURL: spaces_verified_space_list_path,
           space_apps_files_path: spaces_apps_and_files_path,
           unverifiedAppsURL: spaces_unverified_apps_path,
           templateFiles: @space_template.space_template_nodes.where(node_type: 'Node').map(&:node),
           templateApps: @space_template.space_template_nodes.where(node_type: 'App').map(&:node),
           templateSpaces: @space_template.space_template_spaces.map(&:space),
           readonly: true
       })
  end

  def destroy
    SpaceTemplate.find(params[:id]).destroy!
    redirect_to :back
  end


  def create

    space_template = SpaceTemplate.new(template_params.merge({user_id: @context.user.id}))
    unless space_template.valid?
      @space_template = space_template
      @verified_spaces = Space.all_verified

      js({
             space_template_id: @space_template.id,
             spaces: @verified_spaces,
             verifiedSpacesURL: spaces_verified_space_list_path,
             space_apps_files_path: spaces_apps_and_files_path,
             unverifiedAppsURL: spaces_unverified_apps_path,
             templateFiles: template_params["space_template_nodes_attributes"].reject{|f| f['node_type'] == "Node"}.map{|n| n.map{|k,v| f = k.gsub(/node_/,''); [f, v]}.to_h },
             templateApps: template_params["space_template_nodes_attributes"].reject{|f| f['node_type'] == "App"}.map{|n| n.map{|k,v| f = k.gsub(/node_/,'');c = f.gsub(/name/,'title'); [c, v]}.to_h },
             templateSpaces: template_params["space_template_spaces_attributes"].map{|n| n.map{|k,v| f = k.gsub(/space_/,''); [f, v]}.to_h }
         })

      render :new
    else
      session[:template_created] = space_template.id
      space_template.save!

      redirect_to  space_templates_path
    end
  end

  def verified_space_list
    spaces = Space.all_verified
    respond_to do |r|
      r.json{ render json: spaces}
    end
  end

  def unverified_apps
    apps = App.where(verified: false)
    respond_to do |f|
      f.json{ render json: apps }
    end
  end

  def app_file_list
    # list of included files in the template
  end

  def duplicate
    @space_template = SpaceTemplate.find(params[:id])
    @verified_spaces = Space.all_verified

    space_ids = @space_template.space_template_spaces.map(&:space).map(&:id)

    spaces = Space.where(id: space_ids)
    apps = {}
    files = {}

    spaces.to_a.each do |space|
      apps[space.id] = App.accessible_by_space(space).to_a
      files[space.id] = UserFile.accessible_by_space(space).to_a
    end
    spaceData = {apps: apps, files: files}
    js({
           space_template_id: @space_template.id,
           spaces: @verified_spaces,
           verifiedSpacesURL: spaces_verified_space_list_path,
           space_apps_files_path: spaces_apps_and_files_path,
           unverifiedAppsURL: spaces_unverified_apps_path,
           templateFiles: @space_template.space_template_nodes.where(node_type: 'Node').map(&:node),
           templateApps: @space_template.space_template_nodes.where(node_type: 'App').map(&:node),
           templateSpaces: @space_template.space_template_spaces.map(&:space),
           spaceData: spaceData
       })
    @space_template = @space_template.dup
    @space_template.name = "Copy of " + (@space_template.name || "")

    render :edit
  end

  def add_verified_space
    @space_template = SpaceTemplate.find(verified_space_params[:space_template_id])
    @space = Space.find(verified_space_params[:space_id])

    @space_template.space_template_nodes.scope.where(space_id: @space.id).delete_all # avoid duplication on additional assigns

    [App,UserFile].each do |c|
      c.accessible_by_space(@space).each do |a|
        @space_template.space_template_nodes << SpaceTemplateNode.create!({space_id: @space.id, space_template_id: @space_template.id, node: a})
      end
    end
    respond_to do |f|
      f.html { render text: "OK" }
      f.json { render json: {status: "OK"}}
    end
  end

  def verified_space_params
    params.permit(:space_id,:space_template_id)
  end

  def template_params
    params.require(:space_template).permit(:id, :name, :description, :private, space_template_spaces_attributes: [:space_id, :space_name], space_template_nodes_attributes: [:node_id, :node_type, :node_name])
  end
end

class ComparisonsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :featured, :explore, :show]
  before_action :require_login_or_guest, only: [:index, :featured, :explore, :show]

  def index
    if @context.guest?
      redirect_to explore_comparisons_path
      return
    end

    User.sync_comparisons!(@context)

    comparisons = Comparison.editable_by(@context).includes(:taggings)
    @comparisons_grid = initialize_grid(comparisons, {
      name: 'comparisons',
      order: 'comparisons.id',
      order_direction: 'desc',
      per_page: 100,
      include: [:user, {user: :org}, {taggings: :tag}]
    })
  end

  def featured
    org = Org.featured
    if org
      comparisons = Comparison.accessible_by(@context).includes(:user, :taggings).where(:users => { :org_id => org.id })
      @comparisons_grid = initialize_grid(comparisons, {
        name: 'comparisons',
        order: 'comparisons.id',
        order_direction: 'desc',
        per_page: 100,
        include: [:user, {user: :org}, {taggings: :tag}]
      })
    end
    render :index
  end

  def explore
    comparisons = Comparison.accessible_by_public.includes(:taggings)
    @comparisons_grid = initialize_grid(comparisons, {
      name: 'comparisons',
      order: 'comparisons.id',
      order_direction: 'desc',
      per_page: 100,
      include: [:user, {user: :org}, {taggings: :tag}]
    })
    render :index
  end

  def show
    @comparison = Comparison.accessible_by(@context).find(params[:id])

    if @comparison.state == "pending"
      User.sync_comparison!(@context, @comparison.id)
      @comparison.reload
    end

    @meta = @comparison.meta

    @test_vcf = @comparison.input("test_vcf").user_file
    @test_bed = @comparison.input("test_bed").user_file if @comparison.input("test_bed")
    @ref_vcf = @comparison.input("ref_vcf").user_file
    @ref_bed = @comparison.input("ref_bed").user_file if @comparison.input("ref_bed")

    if !@ref_vcf.feedback(@context).nil?
      @feedback = @ref_vcf.feedback(@context)
    elsif !@test_vcf.feedback(@context).nil?
      @feedback = @test_vcf.feedback(@context)
    end

    @outputs_grid = initialize_grid(@comparison.outputs, {
      order: 'name',
      order_direction: 'asc'
    })

    @items_from_params = [@comparison]
    @item_path = pathify(@comparison)
    @item_comments_path = pathify_comments(@comparison)
    @comments = @comparison.root_comments.order(id: :desc).page params[:comments_page]

    @notes = @comparison.notes.real_notes.accessible_by(@context).order(id: :desc).page params[:notes_page]
    @answers = @comparison.notes.accessible_by(@context).answers.order(id: :desc).page params[:answers_page]
    @discussions = @comparison.notes.accessible_by(@context).discussions.order(id: :desc).page params[:discussions_page]

    js id: @comparison.id, roc: @meta["weighted_roc"], state: @comparison.state
  end

  def visualize
    comparison = Comparison.accessible_by(@context).find(params[:id])
    if comparison.state != "done"
      flash[:error] = "You can only visualize comparisons in the 'done' state"
      redirect_to comparison_path(comparison.id)
      return
    end

    api = DNAnexusAPI.new(@context.token)
    files = []
    comparison.outputs.each do |file|
      /(^f[pn]).vcf.gz(.tbi)?$/.match(file.name) do |matches|
        if matches[1] == 'fp'
          name = "FP (only in " + comparison.input("test_vcf").user_file.name + ")" + matches[2].to_s
        else
          name = "FN (only in " + comparison.input("ref_vcf").user_file.name + ")" + matches[2].to_s
        end
        url = api.call(file.dxid, "download", {filename: file.name, project: file.project, preauthenticated: true})["url"]
        files << {name: name, url: url}
      end
    end
    @files_json = files.to_json

    render layout: false
  end

  def new
  end

  def create
    param! :comparison, Hash do |c|
      c.param! :name, String, {required: true}
      c.param! :description, String, {default: ""}
      c.param! :test_vcf_uid, String, {required: true}
      c.param! :test_bed_uid, String
      c.param! :ref_vcf_uid, String, {required: true}
      c.param! :ref_bed_uid, String
    end

    comp_params = params[:comparison]

    files = {}
    # Required files
    ["test_vcf", "ref_vcf"].each do |role|
      files[role] = UserFile.real_files.accessible_by(@context).find_by!(dxid: comp_params["#{role}_uid"])
    end
    # Optional files
    ["test_bed", "ref_bed"].each do |role|
      if comp_params["#{role}_uid"].present?
        files[role] = UserFile.real_files.accessible_by(@context).find_by!(dxid: comp_params["#{role}_uid"])
      end
    end

    # Throw error if a file is not in a 'closed' state
    files.each_key do |role|
      file = files[role]
      if file[:state] != "closed"
        flash[:error] = "File \"#{file[:name]}\" is not in a 'closed' state and cannot be used as a Comparison input."
        redirect_to new_comparison_path
        return
      end
    end

    project = User.find(@context.user_id).private_comparisons_project
    run_input = {
      name: comp_params[:name],
      project: project,
      input: Hash[files.map {|k,v| [k, {"$dnanexus_link": {project: v.project, id: v.uid}}]}]
    }
    jobid = DNAnexusAPI.new(@context.token).call(DEFAULT_COMPARISON_APP, "run", run_input)["id"]

    opts = {
      name: comp_params[:name],
      description: comp_params[:description],
      user_id: @context.user_id,
      scope: "private",
      state: "pending",
      dxjobid: jobid,
      project: project,
      meta: {}
    }

    Comparison.transaction do
      comparison = Comparison.create!(opts)
      files.each_key do |role|
        comparison.inputs.create!(user_file_id: files[role].id, role: role)
      end
    end

    redirect_to :comparisons
  end

  def rename
    @comparison = Comparison.editable_by(@context).find_by!(id: params[:id])
    name = comparison_params[:name]
    if name.is_a?(String) && name != ""
      if @comparison.rename(name, @context)
        @comparison.reload
        flash[:success] = "Comparison renamed to \"#{@comparison.name}\""
      else
        flash[:error] = "Comparison \"#{@comparison.name}\" could not be renamed."
      end
    else
      flash[:error] = "The new name is not a valid string"
    end

    redirect_to comparison_path(@comparison.id)
  end

  def destroy
    @comparison = Comparison.editable_by(@context).find(params[:id])

    projects = nil
    file_ids = nil
    Comparison.transaction do
      @comparison.reload

      # Only allow deletion of comparisons in terminal states, so we don't have to worry about job termination, etc.
      raise if @comparison.state == "pending"

      if @comparison.outputs.size > 0
        # Ensure consistency (all files should be in the private or public comparison project)
        projects = @comparison.outputs.map(&:project).uniq
        raise unless projects.size == 1

        file_ids = @comparison.outputs.map(&:dxid)
      end

      @comparison.outputs.destroy_all
      @comparison.destroy
    end

    if file_ids.present?
      DNAnexusAPI.new(@context.token).call(projects[0], "removeObjects", {objects: file_ids})
    end

    flash[:success] = "Comparison \"#{@comparison.name}\" has been successfully deleted"
    redirect_to :comparisons
  end

  private
    def comparison_params
      params.require(:comparison).permit(:name)
    end
end

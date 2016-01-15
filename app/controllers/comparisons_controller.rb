class ComparisonsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :featured, :explore, :show]
  before_action :require_login_or_guest, only: [:index, :featured, :explore, :show]

  def index
    if @context.guest?
      redirect_to explore_comparisons_path
      return
    end

    User.sync_comparisons!(@context)

    comparisons = Comparison.editable_by(@context)
    @comparisons_grid = initialize_grid(comparisons, {
      name: 'comparisons',
      order: 'comparisons.id',
      order_direction: 'desc',
      per_page: 100,
      include: [:user, {user: :org}]
    })
  end

  def featured
    org = Org.featured
    if org
      comparisons = Comparison.accessible_by(@context).joins(:user).where(:users => { :org_id => org.id })
      @comparisons_grid = initialize_grid(comparisons, {
        name: 'comparisons',
        order: 'comparisons.id',
        order_direction: 'desc',
        per_page: 100,
        include: [:user, {user: :org}]
      })
    end
    render :index
  end

  def explore
    comparisons = Comparison.accessible_by_public
    @comparisons_grid = initialize_grid(comparisons, {
      name: 'comparisons',
      order: 'comparisons.id',
      order_direction: 'desc',
      per_page: 100,
      include: [:user, {user: :org}]
    })
    render :index
  end

  def show
    @comparison = Comparison.accessible_by(@context).find(params[:id])

    if @comparison.state == "pending"
      User.sync_comparison!(@context, @comparison.id)
      @comparison.reload
    end

    @meta = ActiveSupport::JSON.decode(@comparison.meta)

    @test_vcf = @comparison.input("test_vcf").user_file
    @test_tbi = @comparison.input("test_tbi").user_file
    @test_bed = @comparison.input("test_bed").user_file if @comparison.input("test_bed")
    @ref_vcf = @comparison.input("ref_vcf").user_file
    @ref_tbi = @comparison.input("ref_tbi").user_file
    @ref_bed = @comparison.input("ref_bed").user_file if @comparison.input("ref_bed")

    @outputs_grid = initialize_grid(@comparison.outputs, {
      order: 'name',
      order_direction: 'asc'
    })

    @notes = @comparison.notes.accessible_by(@context).order(id: :desc)

    js id: @comparison.id, meta: @meta, state: @comparison.state
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
      c.param! :test_tbi_uid, String, {required: true}
      c.param! :test_bed_uid, String
      c.param! :ref_vcf_uid, String, {required: true}
      c.param! :ref_tbi_uid, String, {required: true}
      c.param! :ref_bed_uid, String
    end

    comp_params = params[:comparison]

    files = {}
    # Required files
    ["test_vcf", "test_tbi", "ref_vcf", "ref_tbi"].each do |role|
      files[role] = UserFile.real_files.accessible_by(@context).find_by!(dxid: comp_params["#{role}_uid"])
    end
    # Optional files
    ["test_bed", "ref_bed"].each do |role|
      if comp_params["#{role}_uid"].present?
        files[role] = UserFile.real_files.accessible_by(@context).find_by!(dxid: comp_params["#{role}_uid"])
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
      meta: {}.to_json
    }

    User.transaction do
      comparison = Comparison.create!(opts)
      files.each_key do |role|
        comparison.inputs.create!(user_file_id: files[role].id, role: role)
      end
      user = User.find(@context.user_id)
      user.pending_comparisons_count = user.pending_comparisons_count + 1
      user.save!
    end

    redirect_to :comparisons

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
end

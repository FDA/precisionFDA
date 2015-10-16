class ComparisonsController < ApplicationController
  def index
    @toolbar = {
      fixed: [
        {icon: "fa fa-bolt fa-fw", label: "Run Comparison", link: new_comparison_path}
      ]
    }

    User.sync_comparisons!(@context.user_id, @context.token)

    comparisons = Comparison.accessible_by(@context.user_id)
    @comparisons_grid = initialize_grid(comparisons, {
      order: 'comparisons.id',
      order_direction: 'desc',
      per_page: 100
    })
  end

  def show
    @comparison = Comparison.accessible_by(@context.user_id).find(params[:id])

    if @comparison.state == "pending"
      User.sync_comparison!(@context.user_id, @comparison.id, @context.token)
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

    js meta: @meta, state: @comparison.state
  end

  def visualize
    comparison = Comparison.accessible_by(@context.user_id).find(params[:id])
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
    # Refresh state of files, if needed
    User.sync_files!(@context.user_id, @context.token)

    @grid_options = {
      action: {
        label: "Select",
        path: "#",
        className: "btn btn-primary btn-sm btn-block btn-select-file event-select-file"
      }
    }

    user_files = UserFile.real_files.accessible_by(@context.user_id)
    @files_grid = initialize_grid(user_files,{
      include: [:user, :biospecimen],
      order: 'user_files.id',
      order_direction: 'desc',
      per_page: 100
    })
  end

  def new2
    # Temporary route for a barebones comparison submission form
    # (Doesn't bother with refreshing state)
    @files = UserFile.real_files.accessible_by(@context.user_id)
  end

  def create

    param! :comparison, Hash do |c|
      c.param! :name, String, {required: true}
      c.param! :description, String, {default: ""}
      c.param! :test_vcf_dxid, String, {required: true}
      c.param! :test_tbi_dxid, String, {required: true}
      c.param! :test_bed_dxid, String
      c.param! :ref_vcf_dxid, String, {required: true}
      c.param! :ref_tbi_dxid, String, {required: true}
      c.param! :ref_bed_dxid, String
    end

    comp_params = params[:comparison]

    # TODO: Decide what happens for files not in "closed" state

    files = {}
    # Required files
    ["test_vcf", "test_tbi", "ref_vcf", "ref_tbi"].each do |role|
      files[role] = UserFile.real_files.accessible_by(@context.user_id).find_by!(dxid: comp_params["#{role}_dxid"])
    end
    # Optional files
    ["test_bed", "ref_bed"].each do |role|
      if comp_params["#{role}_dxid"].present?
        files[role] = UserFile.real_files.accessible_by(@context.user_id).find_by!(dxid: comp_params["#{role}_dxid"])
      end
    end

    project = User.find(@context.user_id).private_comparisons_project
    run_input = {
      name: comp_params[:name],
      project: project,
      input: Hash[files.map {|k,v| [k, {"$dnanexus_link": {project: v.project, id: v.dxid}}]}]
    }
    jobid = DNAnexusAPI.new(@context.token).call(Comparison::DEFAULT_APP, "run", run_input)["id"]

    opts = {
      name: comp_params[:name],
      description: comp_params[:description],
      user_id: @context.user_id,
      public: false,
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
    @comparison = Comparison.accessible_by(@context.user_id).find(params[:id])

    raise if @comparison.state == "pending"

    # TODO: This comparison has outputs, those need to be deleted
    @comparison.destroy

    flash[:success] = "Comparison \"#{@comparison.name}\" has been successfully deleted"
    redirect_to :comparisons
  end
end

class ComparisonsController < ApplicationController
  def index
    @toolbar = {
      fixed: [
        {icon: "fa fa-bolt fa-fw", label: "Run Comparison", link: new_comparison_path}
      ]
    }

    @grid = {
      header: [
        {field: "comparison", display: "Comparison"},
        {field: "variant", display: "Variant"},
        {field: "reference", display: "Reference Variant"},
        {field: "score", display: "Score"},
        {field: "created", display: "Created"},
        {field: "addedBy", display: "Added by"}
      ],
      rows: [
        [
          {field: "comparison", display: "Comparison ABC", icon: "fa fa-lock fa-fw", link: "#"},
          {field: "variant", display: "variant_123.vcf.gz", link: "#"},
          {field: "reference", display: "reference_variant.vcf.gz", link: "#"},
          {field: "score", display: "92%"},
          {field: "created", display: "8/15/2015"},
          {field: "addedBy", display: "Doogie Howser", link: "#"}
        ],
        [
          {field: "comparison", display: "Comparison XYZ", link: "#"},
          {field: "variant", display: "variant_516.vcf.gz", link: "#"},
          {field: "reference", display: "reference_variant_2.vcf.gz", link: "#"},
          {field: "score", display: "95%"},
          {field: "created", display: "4/15/2015"},
          {field: "addedBy", display: "Doogie Howser", link: "#"}
        ]
      ]
    }
  end

  def show
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

    user_files = UserFile.accessible_by(@context.user_id)
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
    @files = UserFile.accessible_by(@context.user_id)
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
      files[role] = UserFile.accessible_by(@context.user_id).find_by!(dxid: comp_params["#{role}_dxid"])
    end
    # Optional files
    ["test_bed", "ref_bed"].each do |role|
      if comp_params["#{role}_dxid"].present?
        files[role] = UserFile.accessible_by(@context.user_id).find_by!(dxid: comp_params["#{role}_dxid"])
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
end

class ComparisonsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :featured, :explore, :show, :fhir_export, :fhir_index, :fhir_cap]
  before_action :require_login_or_guest, only: [:index, :featured, :explore, :show]

  require 'cgi'

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

  def fhir_cap
    interaction = []
    interaction << {
      "code" => "read"
    }

    resource = []
    resource << {
      "type" => "Sequence",
      "interaction" => interaction
    }

    rest = []
    rest << {
      "mode" => "server",
      "resource" => resource
    }

    cap = {
      "resourceType" => "CapabilityStatement",
      "status" => "active",
      "date" => Time.now.strftime("%Y-%m-%d"),
      "kind" => "capability",
      "publisher" => "PrecisionFDA",
      "fhirVersion" => "v1.9.0",
      "acceptUnknown" => "no",
      "format" => ["json", "xml"],
      "rest" => rest
    }

    if request.content_type =~ /xml/
      cap.delete("resourceType")
      render xml: cap.to_xml(:root => "CapabilityStatement")
    else
      render json: JSON.pretty_generate(JSON.parse(cap.to_json))
    end
  end

  def fhir_index
    user_params = params.except(:controller, :action)
    page_number = 1
    page_size = 10
    list = nil
    link = nil
    format = "JSON"
    results = []

    # no unallowed params
    if user_params == query_params
      filtered_params = {}
      query_params.keys.each do |key|
        val = nil
        case key.downcase
        when "page"
          if query_params[:page].to_i >= 1
            page_number = query_params[:page].to_i
          end
        when "name"
          val = query_params[:name].to_s
        when "id"
          val = query_params[:id].to_s
        when "_format"
          format = query_params[:_format].to_s
        else
          next
        end
        if val
          filtered_params[key] = val
        end
      end
      # find what range to display
      results = Comparison.accessible_by_public.where(filtered_params)
      list = results.page(page_number).per(page_size)
    end

    entry = []
    if list
      list.each do |c|
        resource = generate_sequence(c)
        entry << {
          "resource" => resource
        }
      end
    end

    if results.count > page_number * page_size
      link = []
      link << {
        "relation" => "next",
        "url" => request.base_url + request.path + "?" + filtered_params.map{|k,v|"#{CGI::escape(k.to_s)}=#{CGI::escape(v.to_s)};"}.join + "page=#{page_number+1}"
      }
    end

    bundle = {
      "resourceType" => "Bundle",
      "type" => "searchset",
      "total" => results.count
    }
    if link
      bundle["link"] = link
    end
    bundle["entry"] = entry

    if request.content_type =~ /xml/ || format =~ /xml/
      render xml: bundle.to_xml(:root => "Bundle")
    else
      render json: JSON.pretty_generate(JSON.parse(bundle.to_json))
    end
  end

  def fhir_export
    comparison = nil
    if params[:id] =~ /^comparison-(\d+)$/
      comparison = Comparison.accessible_by_public.find_by(id: $1)
    end

    if !comparison
      raise ActionController::RoutingError, 'Not Found'
    end

    sequence = generate_sequence(comparison)
    if request.content_type =~ /xml/
      render xml: sequence.to_xml(:root => "Sequence")
    else
      render json: JSON.pretty_generate(JSON.parse(sequence.to_json))
    end
  end

  def generate_sequence(comparison)
    identifier = []
    identifier << {
      "system" => "https://precision.fda.gov/fhir/Sequence/",
      "value" => comparison.uid
    }

    coding = []
    ["ref_vcf", "ref_bed"].each do |role|
      input = comparison.input(role)
      if input
        coding << {
          "system" => "https://precision.fda.gov/files",
          "code" => input.user_file.dxid,
          "display" => input.user_file.public? ? input.user_file.name : input.user_file.dxid
        }
      end
    end
    standardSequence = {
      "coding" => coding
    }

    app = App.find_by(dxid: COMPARATOR_V1_APP_ID)
    coding = []
    if app
      coding << {
        "system" => "https://precision.fda.gov/apps",
        "code" => app.dxid,
        "display" => app.title,
        "version" => app.revision.to_s
      }
    end
    method = {
      "coding" => coding
    }

    quality_data = {
        "type" => "unknown",
        "standardSequence" => standardSequence,
        "method" => method,
        "truthTP" => comparison.meta["true-pos"].to_i,
        "truthFN" => comparison.meta["false-neg"].to_i,
        "queryFP" => comparison.meta["false-pos"].to_i,
        "precision" => comparison.meta["precision"].to_f,
        "recall" => comparison.meta["recall"].to_f,
        "fMeasure" => comparison.meta["f-measure"].to_f
    }

    # For ROC data points, convert them to floats before exporting
    meta_roc = comparison.meta["weighted_roc"]

    headers_map = {
      "score" => "score",
      "true_positives" => "numTP",
      "false_positives" => "numFP",
      "false_negatives" => "numFN",
      "precision" => "precision",
      "sensitivity" => "sensitivity",
      "f_measure" => "fMeasure"
    }

    if meta_roc["data"].present?
      headers = {}
      meta_roc["header"].map.each_with_index do |h,i|
        new_key = headers_map[h]

        case h
        when "score", "true_positives", "false_positives", "false_negatives"
          headers[new_key] = meta_roc["data"].map do |d|
            d[i].to_i
          end
        else
          headers[new_key] = meta_roc["data"].map do |d|
            d[i].to_f
          end
        end
      end
      quality_data["roc"] = headers
    end

    quality = []
    quality << quality_data

    repository = []
    ["test_vcf", "test_bed"].each do |role|
      input = comparison.input(role)
      if input
        file = {
          "type" => "login",
          "url" => "https://precision.fda.gov" + pathify(input.user_file),
          "name" => "PrecisionFDA",
          "variantsetId" => input.user_file.dxid
        }
        repository << file
      end
    end

    sequence = {
      "resourceType" => "Sequence",
      "type" => "dna",
      "coordinateSystem" => 1,
      "identifier" => identifier,
      "quality" => quality,
      "repository" => repository
    }
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

    def query_params
      params.permit(:id, :name, :page, :_format)
    end
end

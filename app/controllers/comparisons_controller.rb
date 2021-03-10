require "cgi"

# Responsible for comparisons-related actions.
# rubocop:disable Metrics/ClassLength
class ComparisonsController < ApplicationController
  skip_before_action :require_login, only: %i(
    index
    featured
    explore
    show
    fhir_export
    fhir_index
    fhir_cap
  )

  before_action :require_login_or_guest, only: %i(index featured explore show)
  before_action :redirect_guest, only: %i(index)

  def index
    synchronizer = DIContainer.resolve("comparisons.sync.synchronizer")
    synchronizer.sync_comparisons!(@context.user)
    comparisons = Comparison.editable_by(@context).includes(:taggings).order(created_at: :desc)

    @comparisons_grid = initialize_grid(
      comparisons,
      name: "comparisons",
      order: "comparisons.id",
      order_direction: "desc",
      per_page: 100,
      include: [:user, { user: :org }, { taggings: :tag }],
    )
  end

  def fhir_cap
    interaction = []
    interaction << {
      "code" => "read",
    }

    resource = []
    resource << {
      "type" => "Sequence",
      "interaction" => interaction,
    }

    rest = []
    rest << {
      "mode" => "server",
      "resource" => resource,
    }

    cap = {
      "resourceType" => "CapabilityStatement",
      "status" => "active",
      "date" => Time.now.strftime("%Y-%m-%d"),
      "kind" => "capability",
      "publisher" => "PrecisionFDA",
      "fhirVersion" => "v1.9.0",
      "acceptUnknown" => "no",
      "format" => %w(json xml),
      "rest" => rest,
    }

    if request.content_type =~ /xml/
      cap.delete("resourceType")
      render xml: cap.to_xml(root: "CapabilityStatement")
    else
      render json: JSON.pretty_generate(JSON.parse(cap.to_json))
    end
  end

  def fhir_index
    user_params = unsafe_params.except(:controller, :action)
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
          page_number = query_params[:page].to_i if query_params[:page].to_i >= 1
        when "name"
          val = query_params[:name].to_s
        when "id"
          val = query_params[:id].to_s
        when "_format"
          format = query_params[:_format].to_s
        else
          next
        end
        filtered_params[key] = val if val
      end
      # find what range to display
      results = Comparison.accessible_by_public.where(filtered_params)
      list = results.page(page_number).per(page_size)
    end

    entry = []
    list&.each do |c|
      resource = generate_sequence(c)
      entry << {
        "resource" => resource,
      }
    end

    if results.count > page_number * page_size
      link = []
      link << {
        "relation" => "next",
        "url" => request.base_url + request.path + "?" + filtered_params.map { |k, v| "#{CGI.escape(k.to_s)}=#{CGI.escape(v.to_s)};" }.join + "page=#{page_number + 1}",
      }
    end

    bundle = {
      "resourceType" => "Bundle",
      "type" => "searchset",
      "total" => results.count,
    }
    bundle["link"] = link if link
    bundle["entry"] = entry

    if request.content_type =~ /xml/ || format =~ /xml/
      render xml: bundle.to_xml(root: "Bundle")
    else
      render json: JSON.pretty_generate(JSON.parse(bundle.to_json))
    end
  end

  def fhir_export
    comparison = nil
    if unsafe_params[:id] =~ /^comparison-(\d+)$/
      comparison = Comparison.accessible_by_public.find_by(id: Regexp.last_match(1))
    end

    not_found! unless comparison

    sequence = generate_sequence(comparison)
    if request.content_type =~ /xml/
      render xml: sequence.to_xml(root: "Sequence")
    else
      render json: JSON.pretty_generate(JSON.parse(sequence.to_json))
    end
  end

  def featured
    org = Org.featured

    if org
      comparisons = Comparison.accessible_by(@context).includes(:user, :taggings).
        where(users: { org_id: org.id }).
        order(created_at: :desc)

      @comparisons_grid = initialize_grid(comparisons,
                                          name: "comparisons",
                                          order: "comparisons.id",
                                          order_direction: "desc",
                                          per_page: 100,
                                          include: [:user, { user: :org }, { taggings: :tag }])

      js :index, comparisons_ids_with_descriptions(comparisons)
    end
    render :index
  end

  def explore
    comparisons = Comparison.accessible_by_public.includes(:taggings).order(created_at: :desc)

    @comparisons_grid = initialize_grid(comparisons,
                                        name: "comparisons",
                                        order: "comparisons.id",
                                        order_direction: "desc",
                                        per_page: 100,
                                        include: [:user, { user: :org }, { taggings: :tag }])

    js :index, comparisons_ids_with_descriptions(comparisons)
    render :index
  end

  def show
    @comparison = Comparison.accessible_by(@context).find(unsafe_params[:id])

    if @comparison.state == Comparison::STATE_PENDING
      synchronizer = DIContainer.resolve("comparisons.sync.synchronizer")
      synchronizer.sync_comparisons!(@context.user, [@comparison.id])

      @comparison.reload
    end

    @spec = if @comparison.app_dxid == DEFAULT_COMPARISON_APP
      DefaultComparatorApp.input_spec
    else
      Comparisons::ComparatorProvider.call(@comparison.app_dxid)&.input_spec
    end

    @meta = @comparison.meta

    @test_set = @comparison.inputs.select do |file|
      file.role.starts_with?("test_")
    end

    @benchmark_set = @comparison.inputs.select do |file|
      file.role.starts_with?("benchmark_", "ref_")
    end

    @rest_files = @comparison.inputs.reject do |file|
      file.role.starts_with?("test_", "benchmark_", "ref_")
    end

    # NOTE: This should be updated to work for non-default comparator as well.
    if @comparison.app_dxid == DEFAULT_COMPARISON_APP
      test_vcf = @comparison.input("test_vcf").user_file
      ref_vcf = @comparison.input("ref_vcf").user_file

      if !ref_vcf.feedback(@context).nil?
        @feedback = ref_vcf.feedback(@context)
      elsif !test_vcf.feedback(@context).nil?
        @feedback = test_vcf.feedback(@context)
      end
    else
      user_files = UserFile.arel_table
      files = @comparison.outputs.where(user_files[:description].matches("%html_report"))
      @comparator_app = comparator_app(@comparison.app_dxid)

      @output_files = files.map do |file|
        { name: file.name, url: file.file_url(@context, "true", false) }
      end
    end

    @outputs_grid = initialize_grid(
      @comparison.outputs,
      order: "name",
      order_direction: "asc",
    )

    @items_from_params = [@comparison]
    @item_path = pathify(@comparison)
    @item_comments_path = pathify_comments(@comparison)

    @comments = if @comparison.in_space?
      space = item_from_uid(@comparison.scope)
      Comment.
        where(commentable: space, content_object: @comparison).
        order(id: :desc).
        page(unsafe_params[:comments_page])
    else
      @comparison.root_comments.order(id: :desc).page(unsafe_params[:comments_page])
    end

    @notes = @comparison.
      notes.
      real_notes.
      accessible_by(@context).
      order(id: :desc).
      page(unsafe_params[:notes_page])

    @answers = @comparison.
      notes.
      accessible_by(@context).
      answers.
      order(id: :desc).
      page(unsafe_params[:answers_page])

    @discussions = @comparison.
      notes.
      accessible_by(@context).
      discussions.
      order(id: :desc).
      page(unsafe_params[:discussions_page])

    js(
      id: @comparison.id,
      roc: @meta["weighted_roc"],
      state: @comparison.state,
      render: @comparison.app_dxid == DEFAULT_COMPARISON_APP,
    )
  end

  def visualize
    comparison = Comparison.accessible_by(@context).find(unsafe_params[:id])
    if comparison.state != "done"
      flash[:error] = "You can only visualize comparisons in the 'done' state"
      redirect_to comparison_path(comparison.id)
      return
    elsif comparison.app_dxid != DEFAULT_COMPARISON_APP
      not_found!
    end

    api = DNAnexusAPI.new(@context.token)
    files = []
    comparison.outputs.each do |file|
      /(^f[pn]).vcf.gz(.tbi)?$/.match(file.name) do |matches|
        name = if matches[1] == "fp"
          "FP (only in " + comparison.input("test_vcf").user_file.name + ")" + matches[2].to_s
        else
          "FN (only in " + comparison.input("ref_vcf").user_file.name + ")" + matches[2].to_s
        end
        url = api.call(file.dxid, "download", filename: file.name, project: file.project, preauthenticated: true)["url"]
        files << { name: name, url: url }
      end
    end
    @files_json = files.to_json

    render layout: false
  end

  def new
    comparators = App.where(dxid: Setting.comparator_apps)

    selectable_comparators = comparators.map do |app|
      { value: app.dxid, label: app.title }
    end

    # Add global default comparison app to the list.
    global_default_comparator = App.find_by(dxid: DEFAULT_COMPARISON_APP)
    selectable_comparators << {
      value: DEFAULT_COMPARISON_APP,
      label: global_default_comparator&.title || DEFAULT_COMPARISON_APP,
    }

    selectable_comparators.sort_by! { |comp| comp[:label] }

    js selectable_comparators: selectable_comparators.uniq,
       default_comparator: Setting.comparison_app
  end

  # Creates new comparison.
  # rubocop:disable Metrics/MethodLength
  def create
    param! :comparison, Hash do |c|
      c.param! :name, String, required: true
      c.param! :description, String, default: ""
      c.param! :comparison_app, String
      c.param! :inputs, Hash, required: true
    end

    comp_params = unsafe_params[:comparison]
    inputs = comp_params[:inputs]
    app_dxid = CGI.unescape(comp_params[:comparison_app])

    app = if app_dxid == DEFAULT_COMPARISON_APP
      inputs = remap_inputs(inputs)
      DefaultComparatorApp
    else
      Comparisons::ComparatorProvider.call(app_dxid)
    end

    if app.blank?
      render_errors([I18n.t("invalid_comparator")])
      return
    end

    project = User.find(@context.user_id).private_comparisons_project
    input_spec_preparer = InputSpecPreparer.new(@context)
    spec_inputs = input_spec_preparer.run(app, inputs)

    unless input_spec_preparer.valid?
      render_errors(input_spec_preparer.errors)
      return
    end

    api = DIContainer.resolve("api.user")

    files_errors = []
    spec_inputs.files.each do |file|
      next if file.state == UserFile::STATE_CLOSED

      files_errors << I18n.t("comparison_file_not_closed", file: file.name)
    end

    if files_errors.present?
      render_errors(files_errors)
      return
    end

    files = {}

    spec_inputs.run_inputs.each do |input_name, value|
      spec_inputs.files.each do |file|
        next unless file.uid == value

        files[input_name] = file
      end
    end

    run_input = {
      name: comp_params[:name],
      project: project,
      input: spec_inputs.dx_run_input,
    }

    begin
      job_id = api.app_run(app.dxid, nil, run_input)["id"]
    rescue StandardError => e
      json_error = e.message.scan(/({"error".*)/).flatten.first

      raise e if json_error.blank?

      render_errors([JSON.parse(json_error).dig("error", "message")])
      return
    end

    opts = {
      name: comp_params[:name],
      description: comp_params[:description],
      user_id: @context.user_id,
      scope: Comparison::SCOPE_PRIVATE,
      state: Comparison::STATE_PENDING,
      dxjobid: job_id,
      project: project,
      meta: {},
      app_dxid: app.dxid,
      run_input: spec_inputs.dx_run_input.reject do |input_name, _|
        files.keys.include?(input_name)
      end,
    }

    Comparison.transaction do
      comparison = Comparison.create!(opts)

      files.each do |input_name, file|
        comparison.inputs.create!(user_file_id: file.id, role: input_name)
      end
    end

    render json: { url: comparisons_path }
  end
  # rubocop:enable Metrics/MethodLength

  def rename
    @comparison = Comparison.find_by!(id: unsafe_params[:id])
    redirect_to comparison_path(@comparison.id) unless @comparison.editable_by?(@context)

    if @comparison.rename(comparison_params[:name], comparison_params[:description], @context)
      flash[:success] = "Comparison successfully updated"
    else
      flash[:error] = @comparison.errors.messages.values.flatten
    end

    redirect_to comparison_path(@comparison.id)
  end

  def destroy
    @comparison = Comparison.find(unsafe_params[:id])
    redirect_to :comparisons unless @comparison.editable_by?(@context)

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
      DNAnexusAPI.new(@context.token).call(projects[0], "removeObjects", objects: file_ids)
    end

    flash[:success] = "Comparison \"#{@comparison.name}\" has been successfully deleted"
    redirect_to :comparisons
  end

  private

  # find a non-default comparator app by its :dxid
  # @param app_dxid [String] - @comparison.app_dxid
  # @return @comparator_app [App Object]
  def comparator_app(app_dxid)
    App.find_by(dxid: app_dxid)
  end

  # Renders array of errors returning bad request status.
  # @param errors [Array<String>] Array of errors.
  def render_errors(errors)
    render json: errors, status: :bad_request
  end

  # Remaps inputs for default comparison app.
  # @param inputs [Hash] Inputs to remap.
  # @return [Hash] Remapped inputs.
  def remap_inputs(inputs)
    remapped = inputs.dup
    remapped["ref_vcf"] = remapped.delete("benchmark_vcf") if remapped.key?("benchmark_vcf")
    remapped["ref_bed"] = remapped.delete("benchmark_bed") if remapped.key?("benchmark_bed")
    remapped
  end

  # Redirects guest to comparisons' root.
  def redirect_guest
    redirect_to explore_comparisons_path if @context.guest?
  end

  # Tries to find real accessible by user file by file's UID.
  # @param uid [String] UID to try to find file by.
  # @raise [ActiveRecord::RecordNotFound] if file wasn't found.
  # @return [UserFile] Found file.
  def accessible_real_file(uid)
    UserFile.real_files.accessible_by(@context).find_by!(uid: uid)
  end

  def comparison_params
    params.require(:comparison).permit(:name, :description)
  end

  def query_params
    params.permit(:id, :name, :page, :_format)
  end

  # Returns hash containing ids of comparisons that have description.
  # @param comparisons [ActiveRecord::Relation<Comparison>] Comparisons to process.
  # @return [Hash]
  def comparisons_ids_with_descriptions(comparisons)
    selected_ids = comparisons.select { |comparison| comparison.description.present? }.collect(&:id)

    { comparisonsIdsWithDescription: selected_ids }
  end

  # Generates sequence from given comparison.
  # @param comparison [Comparison] Comparison to generate sequence from.
  # @return [Hash] Generated sequence.
  # rubocop:disable Metrics/MethodLength
  def generate_sequence(comparison)
    identifier = []
    identifier << {
      "system" => "https://precision.fda.gov/fhir/Sequence/",
      "value" => comparison.uid,
    }

    coding = []
    %w(ref_vcf ref_bed).each do |role|
      input = comparison.input(role)
      next if input.blank?

      coding << {
        "system" => "https://precision.fda.gov/files",
        "code" => input.user_file.dxid,
        "display" => input.user_file.public? ? input.user_file.name : input.user_file.dxid,
      }
    end

    standard_sequence = { "coding" => coding }

    app = App.find_by(dxid: COMPARATOR_V1_APP_ID)
    coding = []

    if app
      coding << {
        "system" => "https://precision.fda.gov/apps",
        "code" => app.dxid,
        "display" => app.title,
        "version" => app.revision.to_s,
      }
    end

    method = {
      "coding" => coding,
    }

    quality_data = {
      "type" => "unknown",
      "standardSequence" => standard_sequence,
      "method" => method,
      "truthTP" => comparison.meta["true-pos"].to_i,
      "truthFN" => comparison.meta["false-neg"].to_i,
      "queryFP" => comparison.meta["false-pos"].to_i,
      "precision" => comparison.meta["precision"].to_f,
      "recall" => comparison.meta["recall"].to_f,
      "fMeasure" => comparison.meta["f-measure"].to_f,
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
      "f_measure" => "fMeasure",
    }

    if meta_roc["data"].present?
      headers = {}

      meta_roc["header"].map.each_with_index do |h, i|
        new_key = headers_map[h]

        case h
        when "score", "true_positives", "false_positives", "false_negatives"
          headers[new_key] = meta_roc["data"].map { |d| d[i].to_i }
        else
          headers[new_key] = meta_roc["data"].map { |d| d[i].to_f }
        end
      end

      quality_data["roc"] = headers
    end

    quality = []
    quality << quality_data
    repository = []

    %w(test_vcf test_bed).each do |role|
      input = comparison.input(role)
      next if input.blank?

      repository << {
        "type" => "login",
        "url" => "https://precision.fda.gov#{pathify(input.user_file)}",
        "name" => "PrecisionFDA",
        "variantsetId" => input.user_file.dxid,
      }
    end

    {
      "resourceType" => "Sequence",
      "type" => "dna",
      "coordinateSystem" => 1,
      "identifier" => identifier,
      "quality" => quality,
      "repository" => repository,
    }
  end
  # rubocop:enable Metrics/MethodLength
end
# rubocop:enable Metrics/ClassLength

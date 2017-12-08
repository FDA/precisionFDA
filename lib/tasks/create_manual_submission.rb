Job.transaction do
  challenge_id = ARGV[0]            # runner provides challenge_id
  CHALLENGE_TOKEN = ARGV[1]         # runner provides token
  file_id = ARGV[2]                 # runner provides file_id (dxid)

  file = UserFile.find_by!(dxid: file_id)
  user_id = file.user_id
  name = "TBD"
  desc = "TBD"
  inputs = {"entry_vcf" => file_id}       # Please verify
  run_inputs = {}
  input_file_dxids = []
  dx_run_input = {}

  challenge = Challenge.find_by!(id: challenge_id)
  @app = App.find(challenge.app_id)
  @app.input_spec.each do |input|
    key = input["name"]
    optional = (input["optional"] == true)
    has_default = input.has_key?("default")
    default = input["default"]
    klass = input["class"]
    choices = input["choices"]

    if inputs.has_key?(key)
      value = inputs[key]
    elsif has_default
      value = default
    elsif optional
      # No given value and no default, but input is optional; move on
      next
    else
      # Required input is missing
      raise "#{key}: required input is missing"
    end

    # Check compatibility with choices
    raise "#{key}: incompatiblity with choices" if choices.present? && !choices.include?(value)

    if klass == "file"
      raise "#{key}: input file value is not a string" unless value.is_a?(String)
      file = UserFile.real_files.find_by(dxid: value)
      raise "#{key}: input file is not accessible or does not exist" unless !file.nil?
      raise "#{key}: input file's license must be accepted" unless !file.license.present? || file.licensed_by?(@context)

      dxvalue = {"$dnanexus_link" => value}
      input_file_dxids << value
    elsif klass == "int"
      raise "#{key}: value is not an integer" unless value.is_a?(Numeric) && (value.to_i == value)
      value = value.to_i
    elsif klass == "float"
      raise "#{key}: value is not a float" unless value.is_a?(Numeric)
    elsif klass == "boolean"
      raise "#{key}: value is not a boolean" unless value == true || value == false
    elsif klass == "string"
      raise "#{key}: value is not a string" unless value.is_a?(String)
    end

    run_inputs[key] = value
    dx_run_input[key] = dxvalue || value
  end

  challenge_bot = User.find_by!(dxuser: CHALLENGE_BOT_DX_USER)
  project = challenge_bot.private_files_project

  api_input = {
    name: name,
    input: dx_run_input,
    project: project,
    timeoutPolicyByExecutable: {@app.dxid => {"*" => {"days" => 2}}}
  }

  # Run the app
  jobid = DNAnexusAPI.new(CHALLENGE_TOKEN).call(@app.dxid, "run", api_input)["id"]

  # TODO: Candidate for refactoring. See JobCreator
  # Create job record
  opts = {
    dxid: jobid,
    app_series_id: @app.app_series_id,
    app_id: @app.id,
    project: project,
    run_inputs: run_inputs,
    state: "idle",
    name: name,
    describe: {},
    scope: "private",
    user_id: challenge_bot.id
  }

  provenance = {jobid => {app_dxid: @app.dxid, app_id: @app.id, inputs: run_inputs}}
  input_file_dxids.uniq!
  input_file_ids = []
  UserFile.where(dxid: input_file_dxids).find_each do |file|
    if file.parent_type == "Job"
      parent_job = file.parent
      provenance.merge!(parent_job.provenance)
      provenance[file.dxid] = parent_job.dxid
    end
    input_file_ids << file.id
  end
  opts[:provenance] = provenance

  job = nil
  Job.transaction do
    job = Job.create!(opts)
    job.input_file_ids = input_file_ids
    job.save!
    Event::JobRun.create(job, challenge_bot)
  end

  # create submission record
  published_count = 0
  if job
    opts = {
      job_id: job.id,
      desc: desc,
      user_id: user_id,
      challenge_id: challenge.id,
      _inputs: input_file_dxids
    }
    Submission.transaction do
      submission = Submission.create!(opts)
    end
  end
end

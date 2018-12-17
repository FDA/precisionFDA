class JobCreator

  DEFAULT_JOB_STATE = "idle"
  DEFAULT_JOB_SCOPE = "private"

  def initialize(api:, context:, user:, project:)
    @api = api
    @context = context
    @user = user
    @project = project
  end

  def create(app:, name:, input_info:, run_instance_type: nil, scope: nil)
    dxjob_id = create_dx_job(app, input_info, name, run_instance_type)

    Job.transaction do
      job = Job.create!(
        dxid: dxjob_id,
        app_series_id: app.app_series_id,
        app_id: app.id,
        project: project,
        run_inputs: input_info.run_inputs,
        state: DEFAULT_JOB_STATE,
        name: name,
        describe: {},
        scope: scope || DEFAULT_JOB_SCOPE,
        user_id: user.id,
        run_instance_type: run_instance_type
      )
      job.input_file_ids = input_info.file_ids
      job.save!
      job.update_provenance!
      Event::JobRun.create_for(job, context.user)
      job
    end
  end

  def create_dx_job(app, input_info, name, run_instance_type)
    input = api_input(app, name, input_info, run_instance_type)
    api.call(app.dxid, "run", input)["id"]
  end

  private

  attr_reader :api, :user, :context, :project

  def api_input(app, name, input_info, run_instance_type)
    {
      name: name,
      input: input_info.dx_run_input,
      project: project,
      timeoutPolicyByExecutable: { app.dxid => { "*" => { "days" => 2 }}},
      systemRequirements: system_requirements(run_instance_type)
    }.delete_if { |_, value| value.nil? }
  end

  def system_requirements(run_instance_type)
    return unless run_instance_type
    { main: { instanceType: Job::INSTANCE_TYPES[run_instance_type] }}
  end

end

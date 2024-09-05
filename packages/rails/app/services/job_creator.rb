# Responsible for creating jobs.
class JobCreator
  def initialize(api:, context:, user:, project:)
    @api = api
    @context = context
    @user = user
    @project = project
  end

  def create(app:, name:, input_info:, job_limit: CloudResourceDefaults::JOB_LIMIT,
    run_instance_type: nil, scope: nil, output_folder_path: nil)
    dxjob_id = create_dx_job(app, input_info, name, run_instance_type, job_limit)

    Job.transaction do
      job = Job.create!(
        dxid: dxjob_id,
        app_series_id: app.app_series_id,
        app_id: app.id,
        project: project,
        run_inputs: input_info.run_inputs,
        output_folder_path:,
        state: Job::STATE_IDLE,
        name: name,
        describe: {},
        scope: scope || Job::SCOPE_PRIVATE,
        user_id: user.id,
        run_instance_type: run_instance_type,
      )
      job.input_file_ids = input_info.file_ids
      job.save!
      job.update_provenance!
      Event::JobRun.create_for(job, context.user)
      job
    end
  end

  def create_dx_job(app, input_info, name, run_instance_type, job_limit)
    input = api_input(app, name, input_info, run_instance_type, job_limit)

    api.app_run(app.dxid, nil, input)["id"]
  end

  private

  attr_reader :api, :user, :context, :project

  def api_input(app, name, input_info, run_instance_type, job_limit)
    {
      name: name,
      input: input_info.dx_run_input,
      project: project,
      timeoutPolicyByExecutable: { app.dxid => { "*" => { "days" => 10 } } },
      singleContext: true,
      systemRequirements: system_requirements(run_instance_type),
      costLimit: job_limit,
    }.delete_if { |_, value| value.nil? }
  end

  def system_requirements(run_instance_type)
    return unless run_instance_type

    { main: { instanceType: Job::INSTANCE_TYPES[run_instance_type] } }
  end
end
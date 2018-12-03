class TaskService
  attr_reader :context

  def initialize(context)
    @context = context
  end

  def add_task(params)
    params = params[:task].merge({space_id: params[:space_id]}) if params[:task]
    assignee = User.find_by_id(params[:assignee_id])
    assignee_id = assignee.id if assignee
    space_id = (params[:space_id] || params[:task][:space_id]).split("-").first.to_i

    task = Task.new(
      name: params[:name],
      description: params[:description],
      response_deadline: params[:response_deadline],
      completion_deadline: params[:completion_deadline],
      assignee_id: assignee_id,
      space_id: space_id,
      user: context.user
    )
  end
end

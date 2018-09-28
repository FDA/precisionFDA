class TasksController < ApplicationController
  before_action :find_task, only: [:show, :reassign, :copy, :task]
  before_action :find_tasks, only: [:accept, :complete, :decline, :make_active, :reopen]
  before_action :find_membership, only: [:accept, :complete, :decline, :destroy, :make_active, :reopen]

  def task
    task = @task.attributes.merge(
      "response_deadline_f" => @task.response_deadline.try(:strftime, "%m/%d/%Y"),
      "completion_deadline_f" => @task.completion_deadline.try(:strftime, "%m/%d/%Y"),
      "comments_count" => @task.root_comments.size
    )
    render json: task.to_json
  end

  def show
    @space = Space.accessible_by(@context).find(params[:space_id])
    @membership = @space.space_memberships.find_by!(user_id: @context.user_id)

    case @task.status
    when "open"
      @status = 'Awaiting Response'
    when "completed"
      @status = 'Completed'
    when "declined"
      @status = 'Declined'
    when "accepted"
      @status = 'Accepted'
    when "failed_response_deadline"
      @status = 'Failed Response Deadline'
    when "failed_completion_deadline"
      @status = 'Failed Completion Deadline'
    else
      @status = ''
    end

    @items_from_params = [@space, @task]
    @item_path = pathify(@task)
    @item_comments_path = pathify_comments(@task)
    @comments = @task.root_comments.order(id: :desc)
    @commentable = @task

    task = @task.attributes.merge(
      "response_deadline_f" => @task.response_deadline.try(:strftime, "%m/%d/%Y"),
      "completion_deadline_f" => @task.completion_deadline.try(:strftime, "%m/%d/%Y"),
      "comments_count" => @task.root_comments.size
    )

    users = @space.users.map {|u| {label: u.dxuser, value: u.id} }

    js({space_id: @space.id, users: users, task: task})
  end

  def create
    @space = Space.accessible_by(@context).find(params[:space_id])
    @membership = @space.space_memberships.find_by!(user_id: @context.user_id)

    service = TaskService.new(@context)
    @task = service.add_task(params)

    result = @task.save ? Rats.success(@task) : Rats.failure(@task.errors.messages)

    if result.failure?
      js task_params
      render space_tasks_path()
    else
      NotificationsMailer.new_task_email(@task).deliver_now!
      flash[:success] = "Task '#{result.value.name}' successfully created."
      redirect_to tasks_space_path(@space)
    end
  end

  def update
    task = Task.find(params[:id])
    if task.update_task(editable_params)
      flash[:success] = "Task updated"
    else
      flash[:error] = "Could not update the task. Please try again."
    end
    redirect_to :back, status: :see_other rescue redirect_to tasks_space_path(task.space_id)
  end

  def destroy
    task = Task.find(params[:id])
    space_id = task.space_id

    if TaskPolicy.can_delete?(task, @membership) && (task.editable_by?(@context) || task.source_user?(@context))
      task.destroy
      flash[:success] = "Task has been successfully deleted"
    end
    redirect_to :back, status: :see_other rescue redirect_to tasks_space_path(space_id)
  end

  def accept
    @tasks.each do |task|
      if TaskPolicy.can_accept?(task, @membership)
        task.accepted!
        NotificationsMailer.task_updated_email(task, "accepted").deliver_later!
      end
    end
    render json: {status: "success"}
  end

  def decline
    @tasks.each do |task|
      if TaskPolicy.can_decline?(task, @membership)
        task.declined!
        NotificationsMailer.task_updated_email(task, "declined").deliver_later!
        if params.dig(:comment, :body).presence
          comment = Comment.build_from(task, @context.user_id, params[:comment][:body])
          comment.save
        end
      end
    end
    render json: {status: "success"}
  end

  def complete
    @tasks.each do |task|
      if TaskPolicy.can_complete?(task, @membership)
        task.completed!
        NotificationsMailer.task_updated_email(task, "completed").deliver_later!
      end
    end
    render json: {status: "success"}
  end

  def make_active
    @tasks.each do |task|
      if TaskPolicy.can_make_active?(task, @membership)
        task.accepted!
        NotificationsMailer.task_updated_email(task, "made active").deliver_later!
      end
    end
    render json: {status: "success"}
  end

  def reopen
    @tasks.each do |task|
      if TaskPolicy.can_reopen?(task, @membership)
        task.open!
        NotificationsMailer.task_updated_email(task, "reopened").deliver_later!
      end
    end
    render json: {status: "success"}
  end

  def reassign
    assignee = User.find(params[:task][:assignee_id])
    @task.update(assignee_id: assignee.id, status: 0) if assignee
    NotificationsMailer.new_task_email(@task).deliver_later!

    redirect_to tasks_space_path(@task.space_id)
  end

  def copy
    @space = Space.accessible_by(@context).find(params[:space_id])
    @membership = @space.space_memberships.find_by!(user_id: @context.user_id)

    attributes = @task.attributes.merge(assignee_id: @task.assignee.dxuser)
    @task = Task.new(attributes)
    render "new"
  end

  private

  def task_params
    params.permit(:name, :description, :response_deadline, :completion_deadline, :assignee_id)
  end

  def editable_params
    params.require(:task).permit(:response_deadline, :completion_deadline, :name, :description, :assignee_id)
  end

  def find_task
    @task = Task.find(params[:id])
  end

  def find_tasks
    @tasks = Task.find(params[:task_ids] || [])
  end

  def find_membership
    space = Space.accessible_by(@context).find(params[:space_id])
    @membership = space.space_memberships.find_by!(user_id: @context.user_id)
  end
end

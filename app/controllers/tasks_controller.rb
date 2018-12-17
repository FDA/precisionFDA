class TasksController < ApplicationController
  before_action :find_task, only: [:show, :reassign, :copy, :task]
  before_action :find_tasks, only: [:accept, :complete, :decline, :make_active, :reopen]
  before_action :find_space_and_membership, only: [:show, :create, :update, :accept, :complete, :decline, :destroy, :make_active, :reopen, :reassign]

  def task
    task = @task.attributes.merge(
      "response_deadline_f" => @task.response_deadline.try(:strftime, "%m/%d/%Y"),
      "completion_deadline_f" => @task.completion_deadline.try(:strftime, "%m/%d/%Y"),
      "comments_count" => @task.root_comments.size
    )
    render json: task.to_json
  end

  def show
    redirect_to root_url unless TaskPolicy.can_see?(@task, @membership)

    case @task.status
    when "open"
      @status = 'Awaiting Response'
      @dates_titles = {
        respond: 'RESPOND BY',
        complete: 'COMPLETE BY'
      }
    when "completed"
      @status = 'Completed'
      @dates_titles = {
        respond: 'RESPONDED ON',
        complete: 'COMPLETED ON'
      }
    when "declined"
      @status = 'Declined'
      @dates_titles = {
        respond: 'RESPOND BY',
        complete: 'DECLINED ON'
      }
    when "accepted"
      @status = 'Accepted'
      @dates_titles = {
        respond: 'RESPONDED BY',
        complete: 'COMPLETE BY'
      }
    when "failed_response_deadline"
      @status = 'Failed Response Deadline'
      @dates_titles = {
        respond: 'RESPOND BY',
        complete: 'COMPLETE BY'
      }
    when "failed_completion_deadline"
      @status = 'Failed Completion Deadline'
      @dates_titles = {
        respond: 'RESPONDED BY',
        complete: 'COMPLETE BY'
      }
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
    service = TaskService.new(@context)
    @task = service.add_task(params)

    result = @task.save ? Rats.success(@task) : Rats.failure(@task.errors.messages)

    if result.failure?
      errors = result.value.map { |k, v| "#{k} #{v[0]}" }
      render json: { errors: errors }.to_json, status: 500
    else
      SpaceEventService.call(@task.space_id, @context.user_id, nil, @task, :task_created)

      render json: { status: 200 }
    end
  end

  def update
    task = Task.find(params[:id])
    if TaskPolicy.can_edit?(task, @membership)
      task.update_task(editable_params)
    end
    render json: { status: 200 }
  end

  def destroy
    task = Task.find(params[:id])
    space_id = task.space_id

    if TaskPolicy.can_delete?(task, @membership) && (task.editable_by?(@context) || task.source_user?(@context))
      task.destroy

      SpaceEventService.call(space_id, @context.user_id, @membership, task, :task_deleted)
    end
    render json: { status: 200, redirect_url: tasks_space_path(space_id) }
  end

  def accept
    @tasks.each do |task|
      if TaskPolicy.can_accept?(task, @membership)
        task.accepted!
        task.update(response_time: Time.now)
      end
    end
    render json: { status: 200 }
  end

  def decline
    @tasks.each do |task|
      if TaskPolicy.can_decline?(task, @membership)
        task.declined!
        task.update(response_time: Time.now)
        SpaceEventService.call(task.space_id, @context.user_id, @membership, task, :task_declined)
        if params.dig(:comment, :body).presence
          comment = Comment.build_from(task, @context.user_id, params[:comment][:body])
          comment.save
        end
      end
    end
    render json: { status: 200 }
  end

  def complete
    @tasks.each do |task|
      if TaskPolicy.can_complete?(task, @membership)
        task.completed!
        task.update(complete_time: Time.now)
        SpaceEventService.call(task.space_id, @context.user_id, @membership, task, :task_completed)
      end
    end
    render json: { status: 200 }
  end

  def make_active
    @tasks.each do |task|
      if TaskPolicy.can_make_active?(task, @membership)
        task.accepted!
        task.update(complete_time: nil)
        if params.dig(:comment, :body).presence
          comment = Comment.build_from(task, @context.user_id, params[:comment][:body])
          comment.save
        end
      end
    end
    render json: { status: 200 }
  end

  def reopen
    @tasks.each do |task|
      if TaskPolicy.can_reopen?(task, @membership)
        task.open!
        task.update(complete_time: nil, response_time: nil)
        if params.dig(:comment, :body).presence
          comment = Comment.build_from(task, @context.user_id, params[:comment][:body])
          comment.save
        end
      end
    end
    render json: { status: 200 }
  end

  def reassign
    if TaskPolicy.can_reassign?(@task, @membership)
      assignee = User.find_by_id(params[:task][:assignee_id])
      if assignee
        @task.update(assignee_id: assignee.id, status: 0)
        if params.dig(:comment, :body).presence
          comment = Comment.build_from(@task, @context.user_id, params[:comment][:body])
          comment.save
        end
        SpaceEventService.call(@task.space_id, @context.user_id, @membership, @task, :task_reassigned)
      end
    end

    redirect_to :back, status: :see_other rescue redirect_to tasks_space_path(@task.space_id)
  end

  def copy
    @space = Space.accessible_by(@context).find(params[:space_id])
    @membership = @space.space_memberships.find_by!(user_id: @context.user_id)

    attributes = @task.attributes.merge(assignee_id: @task.assignee.dxuser)
    attributes.delete(:response_time)
    attributes.delete(:complete_time)
    @task = Task.new(attributes)
    render "new"
  end

  private

  def task_params
    params.require(:task).permit(:name, :description, :response_deadline, :completion_deadline, :assignee_id)
  end

  def editable_params
    params.require(:task).permit(:response_deadline, :completion_deadline, :name, :description, :assignee_id)
  end

  def find_task
    @task = Task.find(params[:id])
  rescue
    redirect_to tasks_space_path(params[:space_id], filter: :my, status: :awaiting_response)
  end

  def find_tasks
    @tasks = Task.find(params[:task_ids] || [])
  end

  def fetch_membership
    if @context.review_space_admin?
      membership = @space.space_memberships.active.find_by(user_id: @context.user_id)
      membership || SpaceMembership.new_by_admin(@context.user)
    else
      @space.space_memberships.active.find_by!(user_id: @context.user_id)
    end
  end

  def find_space_and_membership
    @space = Space.accessible_by(@context).find(params[:space_id])
    @membership = fetch_membership
  end
end

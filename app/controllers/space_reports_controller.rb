class SpaceReportsController < ApplicationController
  include SpaceReportsHelper

  before_action :find_space

  layout "export", only: [:download_report]

  def index
    results = describe_objects
    render json: results
  end

  def counters
    results = generate_counters
    render json: results
  end

  def download_report
    @results = generate_objects_for_export
    @filters =
      {
        dates: {
          start_date: start_date.strftime("%m/%d/%Y"),
          end_date: end_date.strftime("%m/%d/%Y")
        },
        users: users
      }
    if params[:format] == 'pdf'
      download_pdf
    else
      download_html
    end
  end

  def download_pdf
    pdf = SpaceReportPdf.new(@context, @filters, @results)
    send_data pdf.render, filename: "report.pdf", type: "application/pdf", disposition: 'attachment'
  end

  def download_html
    report = render_to_string "spaces/download_report"
    send_data report, type: 'text/html', filename: 'report.html', disposion: 'attachment'
  end

  # def download_report
  #   results = generate_objects_for_export
  #   filters =
  #     {
  #       dates: {
  #         start_date: start_date.strftime("%m/%d/%Y"),
  #         end_date: end_date.strftime("%m/%d/%Y")
  #       },
  #       users: users
  #     }
  #   data = generate_report(@context.user, results, filters)
  #   send_data data,
  #             disposition: "attachment",
  #             filename: "interaction_report.html",
  #             type: "text/html"
  # end

  private

  def start_date
    Time.parse(params[:date_at])
  rescue
    Date.today.beginning_of_week.to_time
  end

  def end_date
    Time.parse(params[:date_to])
  rescue
    Time.now
  end

  def users
    if params[:users]
      User.where(id: params[:users])
        .map { |u| u.full_name }
        .join(", ")
    end
  end

  def object_type
    params[:type]
  end

  def page
    if params[:page].presence
      params[:page].to_i
    end
  rescue
    1
  end

  def sort
    ["asc", "desc"].include?(params[:sort]) ? params[:sort] : "asc"
  end

  def filter_params
    params.permit(users: [])
  end

  def generate_counters
    filters = filter_params
    filters[:user_id] = filters.delete(:users) if filters[:users]
    files = UserFile.not_assets.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).count
    jobs = Job.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).count
    comparisons = Comparison.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).count
    apps = App.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).count
    workflows = Workflow.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).count
    assets = Asset.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).count
    notes = Note.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).count
    tasks = @space.tasks.where(filters).where("created_at <= ?", end_date).count
    comments = Comment.where(commentable: @space).where(filters).where("created_at <= ?", end_date).count

    {
      files: files,
      jobs: jobs,
      comparisons: comparisons,
      apps: apps,
      assets: assets,
      notes: notes,
      tasks: tasks,
      comments: comments,
      workflows: workflows,
    }
  end

  def generate_feed
    filters = filter_params
    filters[:user_id] = filters.delete(:users) if filters[:users]
    case object_type
    when 'files'
      UserFile.not_assets.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).order(created_at: sort)
    when 'jobs'
      Job.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).order(created_at: sort)
    when 'comparisons'
      Comparison.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).order(created_at: sort)
    when 'apps'
      App.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).order(created_at: sort)
    when 'workflows'
      Workflow.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).order(created_at: sort)
    when 'assets'
      Asset.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).order(created_at: sort)
    when 'notes'
      Note.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).order(created_at: sort)
    when 'tasks'
      @space.tasks.where(filters).where("created_at <= ?", end_date).order(created_at: sort)
    when 'comments'
      Comment.where(commentable: @space).where(filters).where("created_at <= ?", end_date).order(created_at: sort)
    end
  end

  def describe_objects
    collection = generate_feed.includes(:user)
    collection.page(page).per(10)
      .map do |object|
        {
          created_at: object.created_at.strftime("%m/%d/%Y"),
          object_name: object_name(object, object_type),
          object_url: find_path(object),
          user_fullname: object.user.full_name,
          user_avatar: object.user.gravatar_url,
          username: object.user.username,
          comments: find_comments(object),
          additional_info: additional_info(object),
        }
      end
  end

  def object_name(object, object_type)
    case object_type
    when "spaces", "tasks", "jobs", "files", "assets", "comparisons"
      object.name
    when "comments"
      object.body
    when "apps", "notes", "workflows"
      object.title
    else
      ""
    end
  end

  def find_path(object)
    case object_type
    when "tasks"
      if TaskPolicy.can_see?(object, @membership)
        pathify(object)
      else
        ""
      end
    when "comments"
      discuss_space_path(object.commentable)
    else
      if object.accessible_by?(@context)
        pathify(object)
      else
        ""
      end
    end
  end

  def find_comments(object)
    comments =
      case object_type
      when "comments"
        []
      else
        Comment.active.where(commentable: @space, content_object: object, parent_id: nil).includes(user: :org)
      end

    list_comments(comments)
  end

  def list_comments(comments)
    comments.map do |comment|
      {
        created_at: comment.created_at.strftime("%m/%d/%Y"),
        body: comment.body,
        org: comment.user.org.name,
        user_fullname: comment.user.full_name,
        user_avatar: comment.user.gravatar_url,
        username: comment.user.username,
        comments: list_comments(comment.children),
      }
    end
  end

  def additional_info(object)
    if object_type == "comments" && content_object = object.content_object
      name = content_object.try(:name) || content_object.try(:title)
      {
        comment_object_name: name,
        comment_object_type: content_object.klass,
        comment_object_url: pathify(content_object)
      }
    end
  end

  def generate_objects_for_export
    filters = filter_params
    filters[:user_id] = filters.delete(:users) if filters[:users]

    files = UserFile.not_assets.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).includes(:user)
    jobs = Job.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).includes(:user)
    comparisons = Comparison.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).includes(:user)
    apps = App.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).includes(:user)
    workflows = Workflow.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).includes(:user)
    assets = Asset.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).includes(:user)
    notes = Note.accessible_by_space(@space).where(filters).where("created_at <= ?", end_date).includes(:user)
    tasks = @space.tasks.where(filters).where("created_at <= ?", end_date).includes(:user)
    comments = Comment.active.where(commentable: @space).where(filters).where("created_at <= ?", end_date).includes(:user)

    {
      files: describe_objects_for_export(files, "files"),
      jobs: describe_objects_for_export(jobs, "jobs"),
      comparisons: describe_objects_for_export(comparisons, "comparisons"),
      apps: describe_objects_for_export(apps, "apps"),
      assets: describe_objects_for_export(assets, "assets"),
      notes: describe_objects_for_export(notes, "notes"),
      tasks: describe_objects_for_export(tasks, "tasks"),
      comments: describe_objects_for_export(comments, "comments"),
      workflows: describe_objects_for_export(workflows, "workflows"),
    }.to_a
  end

  def describe_objects_for_export(collection, object_type)
    collection
      .map do |object|
        {
          created_at: object.created_at.strftime("%m/%d/%Y"),
          object_name: object_name(object, object_type),
          user_fullname: object.user.full_name,
        }
      end
  end

  def fetch_membership
    if @context.review_space_admin?
      membership = @space.space_memberships.active.find_by(user_id: @context.user_id)
      membership || SpaceMembership.new_by_admin(@context.user)
    else
      @space.space_memberships.active.find_by!(user_id: @context.user_id)
    end
  end

  def find_space
    @space = Space.accessible_by(@context).find_by_id(params[:space_id])
    unless @space
      render json: []
      return
    end
    @membership = fetch_membership
    unless @membership
      render json: []
      return
    end
  end
end

class DiscussionsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :show, :followers]
  before_action :require_login_or_guest, only: [:index, :show, :followers]

  def index
    @discussions = Discussion.accessible_by(@context).order(id: :desc).page params[:discussions_page]
  end

  def show
    @discussion = Discussion.accessible_by(@context).find(params[:id])
    @answers = @discussion.answers.accessible_by(@context).page params[:answers_page]
    @followers = @discussion.user_followers.limit(100)
    orgs = @discussion.user_followers.map(&:org)
    orgs = orgs.uniq { |org| org.id }.sort_by!{ |org| org.name.downcase }

    @follower_orgs = orgs.select{ |org| org.real_org? }.first(100)

    if request.path != discussion_path(@discussion)
      redirect_to @discussion
    else
      js note_js(@discussion.note)
    end
  end

  def followers
    @discussion = Discussion.accessible_by(@context).find(params[:id])
    @followers = @discussion.user_followers
  end

  def edit
    @user = User.find(@context.user_id)
    @discussion = Discussion.editable_by(@context).find(params[:id])
    @note = @discussion.note

    if @discussion.nil?
      flash[:error] = "Sorry, this discussion is not editable by you"
      redirect_to discussion_path(@discussion)
      return
    end

    js note_js(@note)
  end

  def rename
    @discussion = Discussion.editable_by(@context).find_by!(id: params[:id])
    title = discussion_params[:title]
    if title.is_a?(String) && title != ""
      if @discussion.rename(title, @context)
        @discussion.reload
        flash[:success] = "Discussion renamed to \"#{@discussion.title}\""
      else
        flash[:error] = "Discussion \"#{@discussion.title}\" could not be renamed."
      end
    else
      flash[:error] = "The new name is not a valid string"
    end

    redirect_to discussion_path(@discussion)
  end

  def create
    if request.post?
      Note.transaction do
        note = Note.create!({
          user_id: @context.user_id,
          scope: "private",
          note_type: "Discussion",
          title: "#{@context.user.full_name}'s untitled discussion"
        })
        Discussion.transaction do
          @discussion = Discussion.create!(
            user_id: @context.user_id,
            note_id: note.id
          )
          @context.user.follow(@discussion)
        end
      end
      @discussion.reload
      if @discussion.nil?
        flash[:error] = "Sorry, a discussion could not be started"
        redirect_to discussions_path()
      else
        redirect_to edit_discussion_path(@discussion)
      end
    end
  end

  def destroy
    discussion = Discussion.editable_by(@context).find(params[:id])
    title = discussion.title

    discussion.destroy

    flash[:success] = "Discussion \"#{title}\" has been successfully deleted"
    redirect_to :discussions
  end

  private

  def discussion_params
    params.require(:discussion).permit(:title)
  end

  def note_js(note)
    comparisons = note.comparisons
    files = note.real_files
    apps = note.apps
    jobs = note.jobs
    assets = note.assets

    attachments = {
      comparisons: (comparisons.map { |o| describe_for_api(o)}),
      files: (files.map { |o| describe_for_api(o)}),
      apps: (apps.map { |o| describe_for_api(o)}),
      jobs: (jobs.map { |o| describe_for_api(o)}),
      assets: (assets.map { |o| describe_for_api(o)}),
    }

    {
      note: note.slice(:id, :content, :title),
      attachments: attachments,
      edit: params[:edit],
      editable: note.editable_by?(@context)
    }
  end
end

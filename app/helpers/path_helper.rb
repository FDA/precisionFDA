module PathHelper
  include ClientUrlHelper

  def urlify_by_path(path)
    config = Rails.configuration.action_mailer.default_url_options
    URI::HTTPS.build(host: config[:host], port: config[:port], path: path).to_s
  end

  def urlify(item)
    urlify_by_path(pathify(item))
  end

  def pathify_comments(item)
    case item.klass
    when "file"
      file_comments_path(item)
    when "note"
      if item.note_type == "Answer"
        pathify_comments(item.answer)
      elsif item.note_type == "Discussion"
        pathify_comments(item.discussion)
      else
        note_comments_path(item)
      end
    when "app"
      app_comments_path(item)
    when "job"
      job_comments_path(item)
    when "asset"
      asset_comments_path(item)
    when "comparison"
      comparison_comments_path(item)
    when "discussion"
      discussion_comments_path(item)
    when "answer"
      discussion_answer_comments_path(item.discussion, item.user.dxuser)
    when "space"
      space_comments_path(item)
    when "workflow"
      workflow_comments_path(item)
    when "task"
      space_task_comments_path(item.space_id, item)
    when "meta-appathon"
      meta_appathon_comments_path(item)
    when "appathon"
      appathon_comments_path(item)
    when "expert-question"
      expert_expert_question_comments_path(item.expert_id, item.id)
    else
      raise "Unknown class #{item.klass}"
    end
  end

  def pathify(item)
    case item.klass
    when "file"
      file_path(item)
    when "note"
      if item.note_type == "Answer"
        pathify(item.answer)
      elsif item.note_type == "Discussion"
        pathify(item.discussion)
      else
        note_path(item)
      end
    when "app"
      app_path(item)
    when "app-series"
      pathify(item.latest_accessible(@context))
    when "job"
      job_path(item)
    when "asset"
      asset_path(item)
    when "comment"
      if item.commentable_type == 'Space'
        discuss_space_path(item.commentable)
      else
        pathify_comments(item.commentable)
      end
    when "comparison"
      comparison_path(item)
    when "discussion"
      discussion_path(item)
    when "answer"
      discussion_answer_path(item.discussion, item.user.dxuser)
    when "user"
      user_path(item.dxuser)
    when "license"
      license_path(item)
    when "space"
      _space_path(item)
    when "task"
      space_task_path(item.space_id, item)
    when "meta-appathon"
      meta_appathon_path(item)
    when "appathon"
      appathon_path(item)
    when "expert"
      expert_path(item)
    when "expert-question"
      expert_expert_question_path(item.expert_id, item.id)
    when "workflow"
      workflow_path(item)
    when "workflow-series"
      pathify(item.latest_accessible(@context))
    when "folder"
      pathify_folder(item)
    else
      raise "Unknown class #{item.klass}"
    end
  end

  # Returns URL to the specified folder.
  # @param folder [Folder] Folder to get URL for.
  # @return [String] Folder's URL.
  def pathify_folder(folder)
    if folder.private?
      files_path(folder_id: folder.id)
    elsif folder.public?
      explore_files_path(folder_id: folder.id)
    elsif folder.in_space?
      space = folder.space
      api_files_path(space_id: space.id, folder_id: folder.id)
    else
      raise "Unable to build folder's path"
    end
  end

  # Returns redirect URL for comments.
  # @param item [Mixed] Item that holds comments to redirect to.
  # @return [String] URL to redirect to.
  def pathify_comments_redirect(item)
    case item.klass
    when "discussion"
      discussion_comments_path(item)
    when "note"
      if item.note_type == "Answer"
        pathify_comments_redirect(item.answer)
      elsif item.note_type == "Discussion"
        pathify_comments_redirect(item.discussion)
      else
        pathify(item)
      end
    when "workflow"
      return workflow_analyses_path(item) if request.referer =~ /analyses/

      workflow_path(item)
    when "space"
      discuss_space_path(item)
    when "task"
      space_task_path(item.space_id, item)
    when "expert", "expert-question", "meta-appathon", "appathon", "file", "app", "job", "asset",
      "comparison", "answer", "folder"
      pathify(item)
    else
      raise "Unknown class #{item.klass}"
    end
  end
end

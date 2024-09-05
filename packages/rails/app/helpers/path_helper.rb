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
    when "db-cluster"
      api_dbcluster_comments_path(item.dxid)
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
    when "workflow"
      workflow_comments_path(item)
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

  def space_pathify(item, space_id)
    case item.klass
    when "file"
      "/spaces/#{space_id}/files/#{item.uid}"
    when "app"
      "/spaces/#{space_id}/apps/#{item.uid}"
    when "workflow"
      "/spaces/#{space_id}/workflows/#{item.uid}"
    when "job"
      "/spaces/#{space_id}/executions/#{item.uid}"
    when "comparison" # it is in space, but we don't show comparisons in spaces
      "/comparisons/#{item.id}"
    else
      "Unknown class #{item.klass}"
    end
  end

  def pathify(item)
    case item.klass
    when "file"
      "/home/files/#{item.uid}"
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
    when "db-cluster"
      "/home/databases/#{item.dxid}"
    when "job"
      job_path(item)
    when "asset"
      "/home/assets/#{item.uid}"
    when "comment"
      pathify_comments(item.commentable)
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
      "/home/files?folder_id=#{folder.id}"
    elsif folder.public?
      "/home/files/everybody?folder_id=#{folder.id}"
    elsif folder.in_space?
      "/home/files/spaces?folder_id=#{folder.id}"
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
      pathify_comments(item)
    when "expert", "expert-question", "meta-appathon", "appathon", "comparison", "answer"
      pathify(item)
    when "file", "folder", "app", "job", "asset"
      pathify_comments(item)
    else
      raise "Unknown class #{item.klass}"
    end
  end
end

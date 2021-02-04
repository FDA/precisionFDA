module UidFindable
  extend ActiveSupport::Concern

  # Tries to find entity by uid.
  # @raise [RuntimeError] If there is an attempt to find entity of not specified type.
  # @raise [ActiveRecord::RecordNotFound] If unable to find entity.
  # @return [Mixed] Found entity.
  def item_from_uid(uid, specified_klass = nil)
    if uid =~ /^(job|app|file|workflow)-(.{24,})$/
      klass = {
        "app" => App,
        "file" => UserFile,
        "job" => Job,
        "workflow" => Workflow,
      }[$1]

      if specified_klass && klass != specified_klass
        raise "Class '#{klass}' did not match specified class '#{specified_klass}'"
      end

      klass.find_by!(uid: uid)
    elsif uid =~ /^(app-series|workflow-series|appathon|comparison|note|discussion|answer|user|license|space|challenge)-(\d+)$/
      klass = {
        "app-series" => AppSeries,
        "workflow-series" => WorkflowSeries,
        "appathon" => Appathon,
        "comparison" => Comparison,
        "note" => Note,
        "discussion" => Discussion,
        "answer" => Answer,
        "user" => User,
        "license" => License,
        "space" => Space,
        "challenge" => Challenge,
      }[$1]

      id = $2.to_i

      if specified_klass && klass != specified_klass
        raise "Class '#{klass}' did not match specified class '#{specified_klass}'"
      end

      klass.find_by!(id: id)
    else
      raise "Invalid id '#{uid}' in item_from_uid"
    end
  rescue ActiveRecord::RecordNotFound => e
    raise e.message
  end
end

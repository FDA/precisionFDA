# Publishes items.
class PublishWorker < ApplicationWorker
  class PublishError < StandardError; end

  include UidFindable

  sidekiq_retries_exhausted { |job, _ex| notify_user(job) }

  class << self
    def notify_user(job)
      context = Context.build(job["args"].last)
      email = context.user.email
      scope = job["args"].first

      subject = "An error occurred during the publishing in scope '#{scope}'"
      message = "#{subject}: #{job['error_message']}"

      Rails.logger.error(message)

      WorkerMailer.alert_email(email, message, subject).deliver_now
    end
  end

  # Publishes items.
  # @param scope [String] Item scope (public, private, space-xx).
  # @param uids [Array<String>] Array of uids.
  # @param session_auth_params [Hash] User session auth params.
  def perform(scope, uids, session_auth_params)
    @context = Context.build(session_auth_params)
    @scope = scope || "public"
    @uids = uids

    publish
  end

  private

  # Checks if scope is valid and space is accessible by a user.
  # @raise [PublishWorker::PublishError] If scope is invalid or space isn't accessible by a user.
  def check_space!
    unless @scope.is_a?(String)
      raise PublishError,
        "The optional 'scope' input must be a string (either 'public' or 'space-xxxx')"
    end

    return if @scope == "public"

    # Check that scope is a valid scope:
    # - must be of the form space-xxxx
    # - must exist in the Space table
    # - must be accessible by context
    space_id = @scope[/^space-(\d+)$/, 1]

    unless space_id
      raise PublishError, "Invalid scope (only 'public' or 'space-xxxx' are accepted)"
    end

    space = Space.active.find_by(id: space_id)

    raise PublishError, "Invalid space" unless space&.accessible_by?(@context)
  end

  # Checks if items are publishable by a user.
  # @param items [Array<App, Workflow, UserFile, Asset, Job, Note, Discussion, Answer, Comparison>] Items to publish.
  # @raise [PublishWorker::PublishError] If any item isn't publishable by a user.
  def check_items!(items)
    if items.any? { |item| !item.publishable_by?(@context, @scope) }
      raise PublishError, "Unpublishable items detected"
    end
  end

  # Checks if uids is an array of strings.
  # @raise [PublishWorker::PublishError] If uids is not an array of strings.
  def check_uids!
    if !@uids.is_a?(Array) || @uids.any? { |uid| !uid.is_a?(String) }
      raise PublishError, "The input 'uids' must be an array of object ids (strings)"
    end
  end

  # Publish items.
  # @raise [PublishWorker::PublishError] In case of any error.
  def publish
    check_space!
    check_uids!

    items = @uids.uniq.map { |uid| item_from_uid(uid) }.
      reject { |item| item.public? || item.scope == @scope }

    check_items!(items)

    # Files to publish:
    # - All real_files selected by the user
    # - All assets selected by the user
    files = items.select { |item| item.klass == "file" || item.klass == "asset" }

    # Comparisons
    comparisons = items.select { |item| item.klass == "comparison" }

    # Apps
    apps = items.select { |item| item.klass == "app" }

    # Jobs
    jobs = items.select { |item| item.klass == "job" }

    # Notes
    notes = items.select { |item| item.klass == "note" }

    # Discussions
    discussions = items.select { |item| item.klass == "discussion" }

    # Answers
    answers = items.select { |item| item.klass == "answer" }

    workflows = items.select { |item| item.klass == "workflow" }

    published_count = 0

    # Files
    published_count += UserFile.publish(files, @context, @scope) unless files.empty?

    # Comparisons
    published_count += Comparison.publish(comparisons, @context, @scope) unless comparisons.empty?

    # Jobs
    unless jobs.empty?
      published_count += PublishService::JobPublisher.new(@context).publish(jobs, @scope)
    end

    # Notes
    published_count += Note.publish(notes, @context, @scope) unless notes.empty?

    # Discussions
    published_count += Discussion.publish(discussions, @context, @scope) unless discussions.empty?

    # Answers
    published_count += Answer.publish(answers, @context, @scope) unless answers.empty?

    if workflows.any?
      PublishService::WorkflowPublisher.call(workflows, @context, @scope)
      published_count += workflows.count

      workflows.flat_map(&:apps).each do |app|
        next if apps.include?(app) || app.public? || app.scope == @scope

        apps << app
      end
    end

    # Apps
    published_count += AppSeries.publish(apps, @context, @scope) unless apps.empty?

    published_count
  end
end

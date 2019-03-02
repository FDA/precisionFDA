# frozen_string_literal: true
# == Schema Information
#
# Table name: users
#
#  id                          :integer          not null, primary key
#  dxuser                      :string
#  private_files_project       :string
#  public_files_project        :string
#  private_comparisons_project :string
#  public_comparisons_project  :string
#  schema_version              :integer
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  org_id                      :integer
#  first_name                  :string
#  last_name                   :string
#  email                       :string
#  normalized_email            :string
#  last_login                  :datetime
#  extras                      :text
#

class User < ActiveRecord::Base
  include Auditor

  # The "schema_version" field is used to denote the schema
  # associated with this user on the platform. Changing the
  # Rails schema (for example, adding a new whatever_project
  # field in user) should increase the current schema below
  # so that users who log in and whose schema_version is
  # lower will get migrated.
  CURRENT_SCHEMA = 1

  PRODUCTION_ADMINS = %w(

  ).freeze

  NON_PRODUCTION_ADMINS = %w(

  ).freeze

  NON_PRODUCTION_ADMIN_ORGS = %w(

  ).freeze

  CHALLENGE_EVALUATORS = %w(

  ).freeze

  SITE_ADMINS = begin
    if Rails.env.production? && ENV["DNANEXUS_BACKEND"] == "production"
      PRODUCTION_ADMINS
    else
      ENV.fetch("CUSTOM_SITE_ADMINS", "").split(" ").concat(
        NON_PRODUCTION_ADMINS
      )
    end
  end

  SITE_ADMIN_ORGS = ENV["DNANEXUS_BACKEND"] == "production" ? [] : NON_PRODUCTION_ADMIN_ORGS

  has_many :uploaded_files, class_name: "UserFile", dependent: :restrict_with_exception, as: 'parent'
  has_many :user_files
  has_many :assets
  has_many :comparisons
  has_many :notes
  has_many :apps
  has_many :app_series
  has_many :jobs
  has_many :discussions
  has_many :answers
  belongs_to :org
  has_many :licenses
  has_many :accepted_licenses
  has_many :space_memberships
  has_many :space_templates
  has_many :spaces, -> { where("space_memberships.active = ?", true) }, through: :space_memberships
  has_one :appathon
  has_many :meta_appathons
  has_one :expert
  has_many :challenge_app_owners, class_name: 'Challenge', foreign_key: 'app_owner_id'
  has_many :submissions
  has_many :challenge_resources
  has_many :analyses
  has_one :usage_metric
  has_many :tasks
  has_many :workflows
  has_one :notification_preference

  store :extras, accessors: [:has_seen_guidelines], coder: JSON

  include Gravtastic
  gravtastic secure: true, default: "retro"

  acts_as_voter
  acts_as_followable
  acts_as_follower
  acts_as_tagger

  scope :real, -> { where.not(dxuser: CHALLENGE_BOT_DX_USER) }

  # Have the ability to create new review spaces and have full access to
  # activities available within reviewer and cooperative areas.
  scope :review_space_admins, -> { where(dxuser: REVIEW_SPACE_ADMINS) }

  def self.challenge_bot
    find_by!(dxuser: CHALLENGE_BOT_DX_USER)
  end

  def challenge_bot?
    dxuser == CHALLENGE_BOT_DX_USER
  end

  def uid
    "user-#{id}"
  end

  def dxid
    "user-#{dxuser}"
  end

  def klass
    "user"
  end

  def org
    challenge_bot? ? Org.new : super
  end

  def real_files
    user_files.real_files
  end

  def singular?
    org_id.blank? || org.singular
  end

  def can_provision_accounts?
    !singular? && org.admin_id == id
  end

  def billto
    org.dxorg
  end

  def space_uids
    uids = []
    if review_space_admin?
      uids.concat(Space.reviewer.pluck("distinct concat('space-', spaces.id)"))
      uids.concat(Space.verification.pluck("distinct concat('space-', spaces.id)"))
    end
    uids.concat(spaces.pluck("distinct concat('space-', spaces.id)"))
    uids.uniq
  end

  def active_spaces
    spaces.active
  end

  def username
    dxuser
  end

  def full_name
    "#{first_name} #{last_name}"
  end

  def initials
    "#{first_name[0]}#{last_name[0]}"
  end

  def select_text
    "#{username} (#{full_name.titleize}, #{org.name})"
  end

  def is_self(context)
    id == context.user_id
  end

  def appathon_from_meta(meta_appathon)
    following_by_type('Appathon').find do |appathon|
      appathon.meta_appathon.uid == meta_appathon.uid
    end
  end

  def can_administer_site?
    if Rails.env.production? && ENV["DNANEXUS_BACKEND"] == "production"
      SITE_ADMINS.include?(dxuser)
    else
      NON_PRODUCTION_ADMIN_ORGS.include?(org.handle) &&
      org.admin_id == id ||
        SITE_ADMINS.include?(dxuser)
    end
  end

  def is_challenge_evaluator?
    CHALLENGE_EVALUATORS.include?(dxuser) || can_administer_site?
  end

  def review_space_admin?
    REVIEW_SPACE_ADMINS.include?(dxuser)
  end

  # @param time_zone [String] new time zone
  def update_time_zone(time_zone)
    update(time_zone: time_zone) if Time.find_zone(time_zone)
  end

  def root_folder
    folders.find_by(scope: "private", parent_folder_id: nil)
  end

  def is_challenge_admin?
    (can_administer_site? || [].include?(dxuser))
  end

  def self.validate_email(email)
    /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ =~ email
  end

  def self.construct_username(first, last)
    "#{first.downcase.gsub(/[^a-z]/, '')}.#{last.downcase.gsub(/[^a-z]/, '')}"
  end

  def self.authserver_acceptable?(username)
    username.size >= 3 && username.size <= 255 && username =~ /^[a-z][0-9a-z_\.]{2,}$/
  end

  def self.sync_challenge_file!(file_id)
    user = User.challenge_bot
    token = CHALLENGE_BOT_TOKEN
    file = user.uploaded_files.find(file_id) # Re-check file id
    if file.state != "closed"
      result = DNAnexusAPI.new(token).call("system", "describeDataObjects", objects: [file.dxid])["results"][0]
      sync_file_state(result, file, user)
    end
  end

  def self.sync_file!(context, file_id)
    return if context.guest?

    user = context.user
    file = user.uploaded_files.find(file_id) # Re-check file id
    token = context.token

    if file.state != "closed"
      result = DNAnexusAPI.new(token).call("system", "describeDataObjects", objects: [file.dxid])["results"][0]
      sync_file_state(result, file, user)
    end
  end

  def self.sync_files!(context)
    Auditor.suppress do
      return if context.guest?
      user = context.user
      token = context.token
      # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
      user.uploaded_files.where.not(state: "closed").all.each_slice(1000) do |files|
        DNAnexusAPI.new(token).call("system", "describeDataObjects", objects: files.map(&:dxid))["results"].each_with_index do |result, i|
          sync_file_state(result, files[i], user)
        end
      end
    end
  end

  def self.sync_challenge_bot_files!(context)
    return if context.guest?
    user = User.challenge_bot
    token = CHALLENGE_BOT_TOKEN
    # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
    user.uploaded_files.where.not(state: "closed").all.each_slice(1000) do |files|
      DNAnexusAPI.new(token).call("system", "describeDataObjects", objects: files.map(&:dxid))["results"].each_with_index do |result, i|
        sync_file_state(result, files[i], user)
      end
    end
  end

  def self.sync_asset!(context, file_id)
    return if context.guest?
    user = context.user
    token = context.token
    file = user.assets.find(file_id) # Re-check file id
    if file.state != "closed"
      result = DNAnexusAPI.new(token).call("system", "describeDataObjects", objects: [file.dxid])["results"][0]
      sync_file_state(result, file, user)
    end
  end

  def self.sync_assets!(context)
    return if context.guest?
    user = context.user
    token = context.token
    # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
    user.assets.where.not(state: "closed").all.each_slice(1000) do |files|
      DNAnexusAPI.new(token).call("system", "describeDataObjects", objects: files.map(&:dxid))["results"].each_with_index do |result, i|
        sync_file_state(result, files[i], user)
      end
    end
  end

  def self.sync_comparison!(context, comparison_id)
    return if context.guest?
    user = context.user
    token = context.token
    comparison = user.comparisons.find(comparison_id)
    if comparison.state == "pending"
      result = DNAnexusAPI.new(token).call("system", "findJobs",
        includeSubjobs: false,
        id: [comparison.dxjobid],
        project: user.private_comparisons_project,
        parentJob: nil,
        parentAnalysis: nil,
        describe: true,)["results"][0]
      sync_comparison_state(result, comparison, user, token)
    end
  end

  def self.sync_comparisons!(context)
    return if context.guest?
    user = context.user
    token = context.token
    # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
    Comparison.where(user_id: user.id).where(state: "pending").all.each_slice(1000) do |comparisons|
      comparisons_hash = comparisons.map { |c| [c.dxjobid, c] }.to_h
      DNAnexusAPI.new(token).call("system", "findJobs",
        includeSubjobs: false,
        id: comparisons_hash.keys,
        project: user.private_comparisons_project,
        parentJob: nil,
        parentAnalysis: nil,
        describe: true,)["results"].each do |result|
        sync_comparison_state(result, comparisons_hash[result["id"]], user, token)
      end
    end
  end

  def self.sync_challenge_job!(job_id)
    user = User.challenge_bot
    token = CHALLENGE_BOT_TOKEN
    job = user.jobs.find(job_id) # Re-check job id
    unless job.terminal?
      result = DNAnexusAPI.new(token).call("system", "findJobs",
        includeSubjobs: false,
        id: [job.dxid],
        project: user.private_files_project,
        parentJob: nil,
        parentAnalysis: nil,
        describe: true,)["results"][0]
      sync_job_state(result, job, user, token)
    end
  end

  def self.sync_job!(context, job_id)
    return if context.guest?
    user = context.user
    token = context.token
    job = user.jobs.find(job_id) # Re-check job id
    return if job.terminal?

    result = DNAnexusAPI.new(token).call("system", "findJobs",
      includeSubjobs: false,
      id: [job.dxid],
      project:  job.project || user.private_files_project,
      parentJob: nil,
      parentAnalysis: job.analysis.try(:dxid),
      describe: true,)["results"][0]
    return if result.blank?
    sync_job_state(result, job, user, token)
  end

  def self.sync_jobs!(context, jobs = Job.includes(:analysis), project = nil)
    return if context.guest?
    user_id = context.user_id
    token = context.token
    user = User.find(user_id)
    # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
    jobs.where(user_id: user_id).where.not(state: Job::TERMINAL_STATES).all.each_slice(1000) do |jobs_batch|

      jobs_hash = jobs_batch.map { |j| [j.dxid, j] }.to_h
      response = DNAnexusAPI.new(token).call("system", "findJobs",
        includeSubjobs: false,
        id: jobs_hash.keys,
        project: project || user.private_files_project,
        parentJob: nil,
        describe: true,)
      response["results"].each do |result|
        sync_job_state(result, jobs_hash[result["id"]], user, token)
      end
    end
  end

  def self.sync_challenge_jobs!
    user = User.challenge_bot
    # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
    Job.where(user_id: user.id).where.not(state: Job::TERMINAL_STATES).all.each_slice(1000) do |jobs|
      jobs_hash = jobs.map { |j| [j.dxid, j] }.to_h
      DNAnexusAPI.new(CHALLENGE_BOT_TOKEN).call("system", "findJobs",
        includeSubjobs: false,
        id: jobs_hash.keys,
        project: CHALLENGE_BOT_PRIVATE_FILES_PROJECT,
        parentJob: nil,
        parentAnalysis: nil,
        describe: true,)["results"].each do |result|
        sync_job_state(result, jobs_hash[result["id"]], user, CHALLENGE_BOT_TOKEN)
      end
    end
  end

  private

  def self.sync_file_state(result, file, user)
    if result["statusCode"] == 404
      # File was deleted by the DNAnexus stale file daemon; delete it on our end as well
      UserFile.transaction do
        # Use find_by(file.id) since file.reload may raise ActiveRecord::RecordNotFound
        file = UserFile.find_by(id: file.id)
        if file.present?
          Event::FileDeleted.create_for(file, user)
          file.destroy!
        end
      end
    elsif result["describe"].present?
      remote_state = result["describe"]["state"]
      # Only begin transaction if stale file detected
      if remote_state != file.state
        UserFile.transaction do
          old_file_state = file.state
          file.reload
          # confirm local file state is stale
          if remote_state != file.state
            if remote_state == "closed"
              file.update!(state: remote_state, file_size: result["describe"]["size"])
              Event::FileCreated.create_for(file, user)
            elsif remote_state == "closing" && file.state == "open"
              file.update!(state: remote_state)
            else
              # NOTE we should never be here
              raise "File #{id} had local state #{file.state} (previously #{old_file_state}) and remote state #{remote_state}"
            end
          end
        end
      end
    else
      # NOTE we should never be here
      raise
    end
  end

  def self.sync_comparison_state(result, comparison, user, token)
    state = result["describe"]["state"]
    return unless (state == "done") || (state == "failed")
    # NOTE: comparison and job state are only comparable here because state is either "done" or "failed"
    return if state == comparison.state
    if state == "done"
      temp_meta = result["describe"]["output"]["meta"]
      temp_meta["weighted_roc"]["data"] = temp_meta["weighted_roc"]["data"].last(100)
      output_keys = []
      output_ids = []
      output_file_cache = []
      result["describe"]["output"].keys.each do |key|
        # NOTE: meta is the only field of result["describe"]["output"] modified
        next if key == "meta"
        output_keys << key
        output_ids << result["describe"]["output"][key]["$dnanexus_link"]
      end
      DNAnexusAPI.new(token).call("system", "describeDataObjects", objects: output_ids)["results"].each_with_index do |api_result, i|
        raise unless api_result["describe"].present? && api_result["describe"]["state"] == "closed"
        output_file_cache.push(
          dxid: output_ids[i],
          project: user.private_comparisons_project,
          name: api_result["describe"]["name"],
          state: 'closed',
          description: output_keys[i],
          user_id: user.id,
          scope: 'private',
          file_size: api_result["describe"]["size"],
          parent: comparison,
        )
      end

      Comparison.transaction do
        comparison.reload
        if state != comparison.state
          output_file_cache.each do |output_file|
            file = UserFile.create!(output_file)
            Event::FileCreated.create_for(file, user)
          end
          comparison.meta = temp_meta
          comparison.state = state
          comparison.save!
        end
      end
    else
      # Comparison state failed
      Comparison.transaction do
        comparison.reload
        if state != comparison.state
          comparison.state = state
          comparison.save!
        end
      end
    end
  end

  def self.sync_job_state(result, job, user, token)
    state = result["describe"]["state"]
    # Only do anything if local job state is stale
    return if state == job.state
    if state == "done"
      # Use serialization to deep copy result since output will be modified
      output = JSON.parse(result["describe"]["output"].to_json)
      output_file_ids = []
      output_file_cache = []
      output.each_key do |key|
        # TODO: handle arrays later
        raise if output[key].is_a?(Array)
        next unless output[key].is_a?(Hash)
        raise unless output[key].key?("$dnanexus_link")
        output_file_id = output[key]["$dnanexus_link"]
        output_file_ids << output_file_id
        output[key] = output_file_id
      end
      output_file_ids.uniq!
      output_file_ids.each_slice(1000) do |slice_of_file_ids|
        DNAnexusAPI.new(token).call("system", "describeDataObjects", objects: slice_of_file_ids)["results"].each_with_index do |api_result, i|
          # Push avoids creating a new array as opposed to +/+=
          output_file_cache.push(
            dxid: slice_of_file_ids[i],
            project: job.project || user.private_files_project,
            name: api_result["describe"]["name"],
            state: 'closed',
            description: "",
            user_id: user.id,
            scope: job.scope || 'private',
            file_size: api_result["describe"]["size"],
            parent: job,
            parent_folder_id: job.local_folder_id
          )
        end
      end

      # Job is done and outputs need to be created
      Job.transaction do
        job.reload
        if state != job.state
          output_file_cache.each do |output_file|
            user_file = UserFile.create!(output_file)
            if user_file.scope =~ /^space-(\d+)$/
              user_file.update(scoped_parent_folder_id: user_file.parent_folder_id)
            end
            Event::FileCreated.create_for(user_file, user)
          end
          job.run_outputs = output
          job.state = state
          job.describe = result["describe"]
          job.save!
          Event::JobClosed.create_for(job, user)
        end
      end
      if job.scope =~ /^space-(\d+)$/
        SpaceEventService.call(Regexp.last_match(1).to_i, user.id, nil, job, :job_completed)
      end
    else
      # Job state changed but not done (no outputs)
      Job.transaction do
        job.reload
        if state != job.state
          job.state = state
          job.describe = result["describe"]
          job.save!
          Event::JobClosed.create_for(job, user)
        end
      end
    end
  end
end

# == Schema Information
#
# Table name: users
#
#  id                          :integer          not null, primary key
#  dxuser                      :string(255)
#  private_files_project       :string(255)
#  public_files_project        :string(255)
#  private_comparisons_project :string(255)
#  public_comparisons_project  :string(255)
#  schema_version              :integer
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  org_id                      :integer
#  first_name                  :string(255)
#  last_name                   :string(255)
#  email                       :string(255)
#  normalized_email            :string(255)
#  last_login                  :datetime
#  extras                      :text(65535)
#  time_zone                   :string(255)
#  review_app_developers_org   :string(255)      default("")
#  user_state                  :integer          default("enabled"), not null
#  expiration                  :integer
#  disable_message             :string(255)
#

class User < ApplicationRecord
  include Auditor

  EMAIL_FORMAT = %r{
    ^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.
    [0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$
  }x.freeze

  # The "schema_version" field is used to denote the schema
  # associated with this user on the platform. Changing the
  # Rails schema (for example, adding a new whatever_project
  # field in user) should increase the current schema below
  # so that users who log in and whose schema_version is
  # lower will get migrated.
  CURRENT_SCHEMA = 1

  enum user_state: { enabled: 0, locked: 1, deactivated: 2 }

  SYNC_EXCLUDED_FILE_STATES = [
    UserFile::STATE_CLOSED,
    UserFile::STATE_COPYING,
    UserFile::STATE_REMOVING,
  ].freeze

  has_many :uploaded_files, class_name: "UserFile", dependent: :restrict_with_exception, as: "parent"
  has_many :user_files
  has_many :nodes
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
  has_many :admin_memberships, dependent: :destroy
  has_many :admin_groups, through: :admin_memberships
  has_many :space_memberships
  has_many :spaces, -> { where("space_memberships.active = ?", true) }, through: :space_memberships
  has_one :appathon
  has_many :meta_appathons
  has_one :expert, dependent: :destroy
  has_many :challenge_app_owners, class_name: "Challenge", foreign_key: "app_owner_id"
  has_many :submissions
  has_many :challenge_resources
  has_many :analyses
  has_one :usage_metric
  has_many :tasks
  has_many :workflows
  has_one :notification_preference
  has_one :profile, dependent: :destroy
  has_one :invitation, dependent: :nullify
  has_many :org_action_requests,
           inverse_of: :initiator,
           foreign_key: :initiator_id,
           dependent: :destroy

  store :extras, accessors: [:has_seen_guidelines], coder: JSON

  include Gravtastic
  gravtastic secure: true, default: "retro"

  acts_as_voter
  acts_as_followable
  acts_as_follower
  acts_as_tagger

  scope :real, -> { where.not(dxuser: CHALLENGE_BOT_DX_USER) }
  scope :pending, -> { where.not(last_login: nil) }
  scope :belongs_to_org, ->(org_id) { where(org_id: org_id) }

  scope :site_admins, lambda {
    joins(:admin_groups).where(admin_groups: { role: AdminGroup::ROLE_SITE_ADMIN })
  }

  # Have the ability to create new review spaces and have full access to
  # activities available within reviewer and cooperative areas.
  scope :review_space_admins, lambda {
    joins(:admin_groups).where(admin_groups: { role: AdminGroup::ROLE_REVIEW_SPACE_ADMIN })
  }

  scope :challenge_admins, lambda {
    joins(:admin_groups).where(admin_groups: { role: AdminGroup::ROLE_CHALLENGE_ADMIN })
  }

  scope :challenge_evaluators, lambda {
    joins(:admin_groups).where(admin_groups: { role: AdminGroup::ROLE_CHALLENGE_EVALUATOR })
  }

  validates :first_name, length: { minimum: 2, message: "The first name must be at least two letters long." }, presence: true
  validates :last_name, length: { minimum: 2, message: "The last name must be at least two letters long." }, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :disable_message, length: { maximum: 250, message: "Deactivation reason is too long (over 250 characters)" }

  def self.challenge_bot
    find_by!(dxuser: CHALLENGE_BOT_DX_USER)
  end

  def active_leave_org_request
    org_action_requests.leave.find_by(org: org)
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

  def status
    if last_login.nil?
      "Pending"
    else
      case user_state
      when "enabled"
        "Active"
      when "deactivated"
        "Disabled"
      else
        "N/A"
      end
    end
  end

  def org
    challenge_bot? ? Org.new : super
  end

  delegate :real_files, to: :user_files

  def singular?
    org_id.blank? || org.singular
  end

  def can_provision_accounts?
    !singular? && org.admin_id == id
  end

  def billto
    org.dxorg
  end

  # Returns all accessible space scopes.
  # @return [Array] Space scopes (UIDs).
  def space_uids
    Space.accessible_by(self).pluck(Arel.sql("concat('space-', spaces.id)"))
  end

  def activated?
    private_files_project.present? && last_login.present?
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

  def logged_in?
    !Session.find_by(user_id: id).expired?
  rescue StandardError
    false
  end

  def appathon_from_meta(meta_appathon)
    following_by_type("Appathon").find do |appathon|
      appathon.meta_appathon.uid == meta_appathon.uid
    end
  end

  def can_administer_site?
    admin_groups.any?(&:site?)
  end

  # Checks if a user can create spaces.
  # @return [Boolean] Returns true if a user can create spaces, false otherwise.
  def can_create_spaces?
    can_administer_site? || review_space_admin?
  end

  def is_challenge_evaluator?
    challenge_eval? || can_administer_site?
  end

  def challenge_eval?
    admin_groups.any?(&:challenge_eval?)
  end

  def review_space_admin?
    admin_groups.any?(&:space?)
  end

  # @param time_zone [String] new time zone
  def update_time_zone(time_zone)
    update(time_zone: time_zone) if Time.find_zone(time_zone)
  end

  def is_challenge_admin?
    can_administer_site? || admin_groups.any?(&:challenge_admin?)
  end

  def challenge_admin?
    admin_groups.any?(&:challenge_admin?)
  end

  # Selects users, according search string.
  # Users selected are the given org members and are not in 'pending' state.
  # @param search [String] - search string
  # @param org [String] - org handle string
  # @return [ActiveRecord::Relation<User>] - an array of users, searched by search string match.
  def self.org_members(search, org)
    org = Org.find_by(handle: org)
    org_id = org&.id

    query = "%" + sanitize_sql_like(search) + "%"
    users = User.arel_table

    where(users[:dxuser].matches(query).
      or(users[:first_name].matches(query)).
      or(users[:last_name].matches(query))).
      belongs_to_org(org_id).
      pending.
      limit(ORG_MEMBERS_SEARCH_LIMIT)
  end

  def self.validate_email(email)
    EMAIL_FORMAT =~ email
  end

  def self.validate_state(state, zip_code)
    Country.state_matches_zip_code?(state, zip_code)
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

    return if SYNC_EXCLUDED_FILE_STATES.include?(file.state)

    result = DNAnexusAPI.new(token).call(
      "system",
      "describeDataObjects",
      objects: [file.dxid],
    )["results"][0]

    sync_file_state(result, file, user)
  end

  def self.sync_file!(context, file_id)
    return if context.guest?

    user = context.user
    file = user.uploaded_files.find(file_id) # Re-check file id
    token = context.token

    return if SYNC_EXCLUDED_FILE_STATES.include?(file.state)

    result = DNAnexusAPI.new(token).call(
      "system",
      "describeDataObjects",
      objects: [file.dxid],
    )["results"][0]

    sync_file_state(result, file, user)
  end

  def self.sync_files!(context)
    Auditor.suppress do
      return if context.guest?

      user = context.user
      token = context.token

      # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
      user.uploaded_files.
        where.not(state: SYNC_EXCLUDED_FILE_STATES).
        all.each_slice(1000) do |files|
        DNAnexusAPI.new(token).call(
          "system",
          "describeDataObjects",
          objects: files.map(&:dxid),
        )["results"].each_with_index do |result, i|
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
    user.uploaded_files.where.not(state: SYNC_EXCLUDED_FILE_STATES).all.each_slice(1000) do |files|
      DNAnexusAPI.new(token).call(
        "system",
        "describeDataObjects",
        objects: files.map(&:dxid),
      )["results"].each_with_index do |result, i|
        sync_file_state(result, files[i], user)
      end
    end
  end

  def self.sync_asset!(context, file_id)
    return if context.guest?

    user = context.user
    token = context.token
    file = user.assets.find(file_id) # Re-check file id

    return if SYNC_EXCLUDED_FILE_STATES.include?(file.state)

    result = DNAnexusAPI.new(token).call(
      "system",
      "describeDataObjects",
      objects: [file.dxid],
    )["results"][0]

    sync_file_state(result, file, user)
  end

  def self.sync_assets!(context)
    return if context.guest?

    user = context.user
    token = context.token

    # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
    user.assets.where.not(state: SYNC_EXCLUDED_FILE_STATES).all.each_slice(1000) do |files|
      DNAnexusAPI.new(token).call("system", "describeDataObjects", objects: files.map(&:dxid))["results"].each_with_index do |result, i|
        sync_file_state(result, files[i], user)
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
                                           describe: true)["results"][0]
      sync_job_state(result, job, user, token)
    end
  end

  def self.sync_job!(context, job_id)
    return if context.guest?

    user = context.user
    token = context.token
    job = Job.accessible_by(context).find(job_id) # Re-check job id
    return if job.terminal?

    result = DNAnexusAPI.new(token).call("system", "findJobs",
                                         includeSubjobs: false,
                                         id: [job.dxid],
                                         project:  job.project || user.private_files_project,
                                         parentJob: nil,
                                         parentAnalysis: job.analysis.try(:dxid),
                                         describe: true)["results"][0]
    return if result.blank?

    sync_job_state(result, job, user, token)
  end

  def self.sync_jobs!(context, jobs = Job.includes(:analysis), project = nil)
    return if context.guest?

    user_id = context.user_id
    token = context.token
    user = User.find(user_id)
    # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
    jobs.where(user_id: user_id).where.not(state: Job::TERMINAL_STATES).limit(SYNC_JOBS_LIMIT).each_slice(1000) do |jobs_batch|
      jobs_hash = jobs_batch.map { |j| [j.dxid, j] }.to_h
      jobs_hash.keys.each do |job_dxid|
        job_project = project || Job.find_by(dxid: job_dxid).project

        response = DNAnexusAPI.new(token).call(
          "system",
          "findJobs",
          includeSubjobs: false,
          id: [job_dxid],
          project: job_project || user.private_files_project,
          parentJob: nil,
          describe: true,
        )
        response["results"].each do |result|
          next if result.blank?

          sync_job_state(result, jobs_hash[result["id"]], user, token)
        end
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
                                                describe: true)["results"].each do |result|
        sync_job_state(result, jobs_hash[result["id"]], user, CHALLENGE_BOT_TOKEN)
      end
    end
  end

  def self.provision_params(id)
    user = find(id)
    {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    }
  end

  def self.user_helper_attribute(id, attribute)
    find(id)[attribute]
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
            if remote_state == UserFile::STATE_CLOSED
              file.update!(state: remote_state, file_size: result["describe"]["size"])
              Event::FileCreated.create_for(file, user)
            elsif remote_state == UserFile::STATE_CLOSING && file.state == UserFile::STATE_OPEN ||
                  remote_state == UserFile::STATE_ABANDONED
              file.update!(state: remote_state)
            else
              # NOTE we should never be here
              raise "File #{file.uid} had local state #{file.state} " \
                    "(previously #{old_file_state}) and remote state #{remote_state}"
            end
          end
        end
      end
    else
      # NOTE we should never be here
      raise "Unsupported response for file #{file.uid}: #{result}"
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
            state: "closed",
            description: "",
            user_id: user.id,
            scope: job.scope || "private",
            file_size: api_result["describe"]["size"],
            parent: job,
            parent_folder_id: job.local_folder_id,
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

  alias_method :site_admin?, :can_administer_site?
end

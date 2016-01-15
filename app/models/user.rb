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
#  open_files_count            :integer          default(0)
#  closing_files_count         :integer          default(0)
#  pending_comparisons_count   :integer          default(0)
#  schema_version              :integer
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  org_id                      :integer
#  pending_jobs_count          :integer
#  open_assets_count           :integer
#  closing_assets_count        :integer
#  first_name                  :string
#  last_name                   :string
#  email                       :string
#  normalized_email            :string
#  last_login                  :datetime
#  extras                      :text
#

class User < ActiveRecord::Base

  # The "schema_version" field is used to denote the schema
  # associated with this user on the platform. Changing the
  # Rails schema (for example, adding a new whatever_project
  # field in user) should increase the current schema below
  # so that users who log in and whose schema_version is
  # lower will get migrated.
  CURRENT_SCHEMA = 1

  has_many :uploaded_files, {class_name: "UserFile", dependent: :restrict_with_exception, as: 'parent'}
  has_many :user_files
  has_many :assets
  has_many :comparisons
  has_many :notes
  has_many :apps
  has_many :app_series
  has_many :jobs
  belongs_to :org

  store :extras, accessors: [ :has_seen_guidelines ], coder: JSON

  def klass
    "user"
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

  def full_name
    "#{first_name} #{last_name}"
  end

  def can_administer_site?
    if Rails.env.production? && ENV["DNANEXUS_BACKEND"] == "production"
      dxuser == "elaine.johanson" || dxuser == "ruth.bandler"
    else
      org.handle == "precisionfda"
    end
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

  def self.sync_file!(context, file_id)
    return if context.guest?
    user_id = context.user_id
    token = context.token
    User.transaction do
      user = User.find(user_id)
      file = user.uploaded_files.find(file_id) # Re-check file id
      if file.state != "closed"
        result = DNAnexusAPI.new(token).call("system", "describeDataObjects", {objects: [file.dxid]})["results"][0]
        sync_file_state(result, file, user)
      end
    end
  end

  def self.sync_files!(context)
    return if context.guest?
    user_id = context.user_id
    token = context.token
    User.transaction do
      user = User.find(user_id)
      if (user.open_files_count != 0) || (user.closing_files_count != 0)
        # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
        user.uploaded_files.where.not(state: "closed").all.each_slice(1000) do |files|
          DNAnexusAPI.new(token).call("system", "describeDataObjects", {objects: files.map(&:dxid)})["results"].each_with_index do |result, i|
            sync_file_state(result, files[i], user)
          end
        end
      end
    end
  end

  def self.sync_asset!(context, file_id)
    return if context.guest?
    user_id = context.user_id
    token = context.token
    User.transaction do
      user = User.find(user_id)
      file = user.assets.find(file_id) # Re-check file id
      if file.state != "closed"
        result = DNAnexusAPI.new(token).call("system", "describeDataObjects", {objects: [file.dxid]})["results"][0]
        sync_asset_state(result, file, user)
      end
    end
  end

  def self.sync_assets!(context)
    return if context.guest?
    user_id = context.user_id
    token = context.token
    User.transaction do
      user = User.find(user_id)
      if (user.open_assets_count != 0) || (user.closing_assets_count != 0)
        # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
        user.assets.where.not(state: "closed").all.each_slice(1000) do |files|
          DNAnexusAPI.new(token).call("system", "describeDataObjects", {objects: files.map(&:dxid)})["results"].each_with_index do |result, i|
            sync_asset_state(result, files[i], user)
          end
        end
      end
    end
  end

  def self.sync_comparison!(context, comparison_id)
    return if context.guest?
    user_id = context.user_id
    token = context.token
    User.transaction do
      user = User.find(user_id)
      comparison = user.comparisons.find(comparison_id) # Re-check comparison id
      if comparison.state == "pending"
        result = DNAnexusAPI.new(token).call("system", "findJobs", {
          includeSubjobs: false,
          id: [comparison.dxjobid],
          project: user.private_comparisons_project,
          parentJob: nil,
          parentAnalysis: nil,
          describe: true
        })["results"][0]
        sync_comparison_state(result, comparison, user, token)
      end
    end
  end

  def self.sync_comparisons!(context)
    return if context.guest?
    user_id = context.user_id
    token = context.token
    User.transaction do
      user = User.find(user_id)
      if user.pending_comparisons_count != 0
        # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
        Comparison.where(user_id: user_id).where(state: "pending").all.each_slice(1000) do |comparisons|
          comparisons_hash = comparisons.map { |c| [c.dxjobid, c] }.to_h
          DNAnexusAPI.new(token).call("system", "findJobs", {
            includeSubjobs: false,
            id: comparisons_hash.keys,
            project: user.private_comparisons_project,
            parentJob: nil,
            parentAnalysis: nil,
            describe: true
          })["results"].each do |result|
            sync_comparison_state(result, comparisons_hash[result["id"]], user, token)
          end
        end
      end
    end
  end

  def self.sync_job!(context, job_id)
    return if context.guest?
    user_id = context.user_id
    token = context.token
    User.transaction do
      user = User.find(user_id)
      job = user.jobs.find(job_id) # Re-check job id
      if !job.terminal?
        result = DNAnexusAPI.new(token).call("system", "findJobs", {
          includeSubjobs: false,
          id: [job.dxid],
          project: user.private_files_project,
          parentJob: nil,
          parentAnalysis: nil,
          describe: true
        })["results"][0]
        sync_job_state(result, job, user, token)
      end
    end
  end

  def self.sync_jobs!(context)
    return if context.guest?
    user_id = context.user_id
    token = context.token
    User.transaction do
      user = User.find(user_id)
      if user.pending_jobs_count != 0
        # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
        Job.where(user_id: user_id).where.not(state: Job::TERMINAL_STATES).all.each_slice(1000) do |jobs|
          jobs_hash = jobs.map { |j| [j.dxid, j] }.to_h
          DNAnexusAPI.new(token).call("system", "findJobs", {
            includeSubjobs: false,
            id: jobs_hash.keys,
            project: user.private_files_project,
            parentJob: nil,
            parentAnalysis: nil,
            describe: true
          })["results"].each do |result|
            sync_job_state(result, jobs_hash[result["id"]], user, token)
          end
        end
      end
    end
  end

  private

  def self.sync_file_state(result, file, user)
    if result["statusCode"] == 404
      # File was deleted by the DNAnexus stale file daemon; delete it on our end as well
      if file.state == "open"
        user.open_files_count = user.open_files_count - 1
      else
        user.closing_files_count = user.closing_files_count - 1
      end
      user.save!
      file.destroy!
    elsif result["describe"].present?
      state = result["describe"]["state"]
      if state != file.state
        # NOTE the following should never fail
        raise unless ((state == "closed") && (file.state == "closing"))
        file.update!(state: state, file_size: result["describe"]["size"])
        user.closing_files_count = user.closing_files_count - 1
        user.save!
      end
    else
      # NOTE we should never be here
      raise
    end
  end

  def self.sync_asset_state(result, file, user)
    if result["statusCode"] == 404
      # File was deleted by the DNAnexus stale file daemon; delete it on our end as well
      if file.state == "open"
        user.open_assets_count = user.open_assets_count - 1
      else
        user.closing_assets_count = user.closing_assets_count - 1
      end
      user.save!
      file.destroy!
    elsif result["describe"].present?
      state = result["describe"]["state"]
      if state != file.state
        # NOTE the following should never fail
        raise unless ((state == "closed") && (file.state == "closing"))
        file.update!(state: state, file_size: result["describe"]["size"])
        user.closing_assets_count = user.closing_assets_count - 1
        user.save!
      end
    else
      # NOTE we should never be here
      raise
    end
  end

  def self.sync_comparison_state(result, comparison, user, token)
    state = result["describe"]["state"]
    return unless ((state == "done") || (state == "failed"))
    user.pending_comparisons_count = user.pending_comparisons_count - 1
    user.save!
    comparison.state = state
    if state == "done"
      comparison.meta = result["describe"]["output"]["meta"].to_json
      output_keys = []
      output_ids = []
      result["describe"]["output"].keys.each do |key|
        next if key == "meta"
        output_keys << key
        output_ids << result["describe"]["output"][key]["$dnanexus_link"]
      end
      DNAnexusAPI.new(token).call("system", "describeDataObjects", {objects: output_ids})["results"].each_with_index do |result, i|
        raise unless result["describe"].present? && result["describe"]["state"] == "closed"
        UserFile.create!(
          dxid: output_ids[i],
          project: user.private_comparisons_project,
          name: result["describe"]["name"],
          state: 'closed',
          description: output_keys[i],
          user_id: user.id,
          scope: 'private',
          file_size: result["describe"]["size"],
          parent: comparison
        )
      end
    end
    comparison.save!
  end

  def self.sync_job_state(result, job, user, token)
    state = result["describe"]["state"]
    if Job::TERMINAL_STATES.include?(state)
      user.pending_jobs_count = user.pending_jobs_count - 1
      user.save!
      job.state = state
      job.describe = result["describe"]
      if state == "done"
        output = result["describe"]["output"]
        output_file_ids = []
        output.each_key do |key|
          # TODO handle arrays later
          raise if output[key].is_a?(Array)
          if output[key].is_a?(Hash)
            raise unless output[key].has_key?("$dnanexus_link")
            output_file_id = output[key]["$dnanexus_link"]
            output_file_ids << output_file_id
            output[key] = output_file_id
          end
        end
        output_file_ids.uniq!
        if !output_file_ids.empty?
          output_file_ids.each_slice(1000) do |slice_of_file_ids|
            DNAnexusAPI.new(token).call("system", "describeDataObjects", {objects: slice_of_file_ids})["results"].each_with_index do |result, i|
              raise unless result["describe"].present? && result["describe"]["state"] == "closed"
              UserFile.create!(
                dxid: slice_of_file_ids[i],
                project: user.private_files_project,
                name: result["describe"]["name"],
                state: 'closed',
                description: "",
                user_id: user.id,
                scope: 'private',
                file_size: result["describe"]["size"],
                parent: job
              )
            end
          end
        end
        job.run_outputs = output
      end
      job.save!
    elsif state != job.state
      job.state = state
      job.describe = result["describe"]
      job.save!
    end
  end
end

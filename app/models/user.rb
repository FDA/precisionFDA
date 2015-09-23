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
#  open_files_count            :integer
#  closing_files_count         :integer
#  pending_comparisons_count   :integer
#  schema_version              :integer
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  org_id                      :integer
#

class User < ActiveRecord::Base

  # The "schema_version" field is used to denote the schema
  # associated with this user on the platform. Changing the
  # Rails schema (for example, adding a new whatever_project
  # field in user) should increase the current schema below
  # so that users who log in and whose schema_version is
  # lower will get migrated.
  CURRENT_SCHEMA = 1

  has_many :biospecimens
  has_many :user_files
  has_many :comparisons
  belongs_to :org

  def self.sync_file!(user_id, file_id, token)
    # TODO: Loop until transaction succeeds
    User.transaction do
      user = User.find(user_id)
      file = user.user_files.find(file_id) # Re-check file id
      if file.state != "closed"
        result = DNAnexusAPI.new(token).call("system", "describeDataObjects", {objects: [file.dxid]})["results"][0]
        sync_state(result, file, user)
      end
    end
  end

  def self.sync_files!(user_id, token)
    # TODO: Loop until transaction succeeds
    User.transaction do
      user = User.find(user_id)
      if (user.open_files_count != 0) || (user.closing_files_count != 0)
        # Prefer "all.each_slice" to "find_batches" as the latter might not be transaction-friendly
        UserFile.where(user_id: user_id).where.not(state: "closed").all.each_slice(1000) do |files|
          DNAnexusAPI.new(token).call("system", "describeDataObjects", {objects: files.map(&:dxid)})["results"].each_with_index do |result, i|
            sync_state(result, files[i], user)
          end
        end
      end
    end
  end

  private

  def self.sync_state(result, file, user)
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
        # TODO the following should never fail
        raise unless ((state == "closed") && (file.state == "closing"))
        file.update!(state: state, file_size: result["describe"]["size"])
        user.closing_files_count = user.closing_files_count - 1
        user.save!
      end
    else
      # TODO we should never be here
      raise
    end
  end
end

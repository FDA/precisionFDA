# == Schema Information
#
# Table name: nodes
#
#  id                      :integer          not null, primary key
#  dxid                    :string(255)
#  project                 :string(255)
#  name                    :string(255)
#  state                   :string(255)
#  description             :text(65535)
#  user_id                 :integer          not null
#  file_size               :bigint
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  parent_id               :integer
#  parent_type             :string(255)
#  scope                   :string(255)
#  parent_folder_id        :integer
#  sti_type                :string(255)
#  scoped_parent_folder_id :integer
#  uid                     :string(255)
#

# Parent types:
# ------------
# User (for files externally uploaded)
# Job (for files generated from a job)
# Asset (for app assets)
# Comparison (for files generated from a comparison)
#
# Feature matrix
#
#                                | U | J | A | C
# -------------------------------+---+---+---+---
# Shows up in files#index        | Y | Y | N | N
# Shows up in files#show         | Y | Y | N | Y
# Can be deleted independently   | Y | Y | Y | N
# Can be published independently | Y | Y | Y | N
# Can be attached independently  | Y | Y | Y | N
#
# To help with the above, we define the following scopes
# real_files: U || J
# not_assets: U || J || C
# independent: U || J || A
#
class UserFile < Node
  include Licenses
  include InternalUid
  require "uri"

  DESCRIPTION_MAX_LENGTH = 65535

  STATE_ABANDONED = "abandoned".freeze
  STATE_CLOSING = "closing".freeze
  STATE_CLOSED = "closed".freeze
  STATE_OPEN = "open".freeze

  PARENT_TYPE_COMPARISON = "Comparison".freeze

  has_many :attachments, as: :item, dependent: :destroy
  has_many :notes, through: :attachments
  has_many :comparison_inputs
  has_many :comparisons, ->{ distinct },
           through: :comparison_inputs,
           dependent: :restrict_with_exception

  has_and_belongs_to_many :jobs_as_input, join_table: "job_inputs", class_name: "Job"

  has_one :licensed_item, as: :licenseable, dependent: :destroy
  has_one :license, through: :licensed_item
  has_many :accepted_licenses, through: :license

  has_many :challenge_resources

  acts_as_commentable
  acts_as_votable

  validates :name, presence: { message: "Name could not be blank" }
  validates :description,
            allow_blank: true,
            length: {
              maximum: DESCRIPTION_MAX_LENGTH,
              too_long: "Description could not be greater than #{DESCRIPTION_MAX_LENGTH} characters",
            }

  class << self; undef_method :open; end
  scope :open, -> { where(state: STATE_OPEN) }

  scope :files_conditions, -> {
    where(state: "closed").where.not(parent_type: ["Comparison", nil]).includes(:taggings)
  }

  class << self
    def model_name
      ActiveModel::Name.new(self, nil, "File")
    end

    def real_files
      where(parent_type: ["User", "Job", "Node", "Comparison"])
    end

    def not_assets
      where.not(parent_type: "Asset")
    end

    def independent
      where.not(parent_type: PARENT_TYPE_COMPARISON)
    end

    def closed
      where(state: "closed")
    end

    def publication_project!(user, scope)
      # This is a class method for independent files.
      # For comparison files, use Comparison.publication_project!
      if scope == "public"
        user.public_files_project
      else
        Space.from_scope(scope).project_for_user(user)
      end
    end

    def publish(files, context, scope)
      file_publisher = FilePublisher.by_context(context)
      file_publisher.publish(files, scope)
    end

    def batch_private_files(context,scopes, parent_folder_id)
      UserFile
        .real_files
        .editable_by(context)
        .files_conditions
        .where(scope: scopes, parent_folder_id: parent_folder_id)
    end

    def batch_space_files(spaces_params)
      UserFile
        .real_files
        .editable_in_space(spaces_params[:context], spaces_params[:spaces_members_ids])
        .files_conditions
        .where(
          scope: spaces_params[:scopes],
          scoped_parent_folder_id: spaces_params[:scoped_parent_folder_id]
        )
    end
  end

  def real_file?
    parent_type == "User" || parent_type == "Job"
  end

  def is_submission_output?
    parent_type == "Job" && parent.submission.present?
  end

  def to_param
    uid
  end

  # Returns a parent folder name of UserFile
  # @param [scope] a file scope
  # @return [String] folder name or "/" for root
  def parent_folder_name(scope = "private")
    folder = parent_folder(scope)
    folder.blank? ? "/" : folder.name
  end

  def parent_folder(scope = "private")
    column_name = Node.scope_column_name(scope)
    Folder.find_by(id: self[column_name])
  end

  # Returns a full path to current file
  # @param [scope] a file scope]
  # @return [String] file path or "/" for root
  def file_full_path(scope = "private")
    parent_folder = parent_folder(scope)
    folders = []
    if parent_folder.blank?
      "/"
    else
      folders << parent_folder_name(scope)
      folders << parent_folder.ancestors(scope).pluck(:name)
    end

    collect_path_string(folders.flatten.reverse)
  end

  # Collects a string of file's path.
  # @param [dir_set] Array of strings: ["second_level_folder", "third_level_folder"]
  # @return [String] file path or "/" for root. Ex. "/second_level_folder/third_level_folder/"
  def collect_path_string(dir_set)
    path = "/"
    dir_set.each { |dir| path = path + dir + "/" }
    path
  end

  def not_asset?
    parent_type != "Asset"
  end

  def asset?
    sti_type == "Asset"
  end

  def open?
    state == STATE_OPEN
  end

  def independent?
    !parent_comparison?
  end

  def parent_comparison?
    parent_type == PARENT_TYPE_COMPARISON
  end

  def klass
    parent_type == "Asset" ? "asset" : "file"
  end

  def describe_fields
    ["title", "description", "state", "file_size"]
  end

  def feedback(context)
    if dxid == NIST_VCF_UID && context
      if context.guest?
        "https://docs.google.com/forms/d/1cF0XoeGbLJUSRC3pvEz36DMdlpWA9nFwUXJA_o-oxrU/viewform?entry.556919704=NISTv2.19"
      else
        user_name = URI.encode_www_form_component(context.user.full_name)
        user_email = URI.encode_www_form_component(context.user.email)
        user_org = URI.encode_www_form_component(context.user.org.name)
        "https://docs.google.com/forms/d/1cF0XoeGbLJUSRC3pvEz36DMdlpWA9nFwUXJA_o-oxrU/viewform?entry.764685280=#{user_name}&entry.1095215913=#{user_email}&entry.451016179=#{user_org}&entry.556919704=NISTv2.19"
      end
    else
      nil
    end
  end

  def deletable?
    ((parent_type == "User") || (parent_type == "Job")) && ((scope == "private" || scope == "public") || !(in_space? && space_object.verified?))
  end

  def publishable_by?(context, scope_to_publish_to = "public")
    core_publishable_by?(context, scope_to_publish_to) && !parent_comparison? && state == "closed"
  end

  def rename(new_name, description, context)
    self.name = new_name
    self.description = description

    return false unless valid?

    if DNAnexusAPI.new(context.token).call(dxid, "rename", { project: project, name: new_name })
      update_attributes(name: new_name, description: description)
    else
      errors.add(:base, "File info could not be updated.")
      false
    end
  end

  def passes_consistency_check?(user)
    if private?
      if independent?
        project == user.private_files_project
      else
        project == user.private_comparisons_project
      end
    elsif public?
      project == user.public_files_project
    else
      project == space_object.project_for_user(user)
    end
  end

  def created_by_challenge_bot?
    challenge_resources.any? || User.challenge_bot == user
  end
end

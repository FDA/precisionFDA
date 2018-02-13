# == Schema Information
#
# Table name: user_files
#
#  id          :integer          not null, primary key
#  dxid        :string
#  project     :string
#  name        :string
#  state       :string
#  description :text
#  user_id     :integer
#  file_size   :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  parent_id   :integer
#  parent_type :string
#  scope       :string
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
  require 'uri'

  DESCRIPTION_MAX_LENGTH = 1000

  STATE_CLOSING = "closing"
  STATE_CLOSED = "closed"
  STATE_OPEN = "open"

  PARENT_TYPE_COMPARISON = "Comparison"

  belongs_to :user
  belongs_to :parent, {polymorphic: true}
  has_many :notes, {through: :attachments}
  has_many :attachments, {as: :item, dependent: :destroy}
  has_many :comparison_inputs
  has_many :comparisons, -> { distinct }, {through: :comparison_inputs, dependent: :restrict_with_exception}

  has_and_belongs_to_many :jobs_as_input, {join_table: "job_inputs", class_name: "Job"}

  has_one :licensed_item, {as: :licenseable, dependent: :destroy}
  has_one :license, {through: :licensed_item}
  has_many :accepted_licenses, {through: :license}

  has_many :challenge_resources

  acts_as_commentable
  acts_as_votable

  validates :name, presence: { message: "Name could not be blank" }
  validates :description,
            allow_blank: true,
            length: {
              maximum: DESCRIPTION_MAX_LENGTH,
              too_long: "Description could not be greater than #{DESCRIPTION_MAX_LENGTH} characters"
            }

  def self.model_name
    ActiveModel::Name.new(self, nil, "File")
  end

  def self.real_files
    return where(parent_type: ['User', 'Job'])
  end

  def self.not_assets
    return where.not(parent_type: 'Asset')
  end

  def self.independent
    return where.not(parent_type: PARENT_TYPE_COMPARISON)
  end

  def self.closed
    return where(state: 'closed')
  end

  def self.publication_project!(user, scope)
    # This is a class method for independent files.
    # For comparison files, use Comparison.publication_project!
    if scope == "public"
      user.public_files_project
    else
      Space.from_scope(scope).project_for_user!(user)
    end
  end

  def self.publish(files, context, scope)
    file_publisher = FilePublisher.by_context(context)
    file_publisher.publish(files, scope)
  end

  def real_file?
    return parent_type == "User" || parent_type == "Job"
  end

  def is_submission_output?
    return parent_type == "Job" && parent.submission.present?
  end

  def to_param
    uid
  end

  def parent_folder(scope = "private")
    column_name = Node.scope_column_name(scope)
    Folder.find_by(id: self[column_name])
  end

  def not_asset?
    return parent_type != "Asset"
  end

  def independent?
    !parent_comparison?
  end

  def parent_comparison?
    parent_type == PARENT_TYPE_COMPARISON
  end

  def uid
    dxid
  end

  def klass
    parent_type == "Asset" ? "asset" : "file"
  end

  def describe_fields
    ["title", "description", "state", "file_size"]
  end

  def feedback(context)
    if uid == NIST_VCF_UID && context
      if context.guest?
        return "https://docs.google.com/forms/d/1cF0XoeGbLJUSRC3pvEz36DMdlpWA9nFwUXJA_o-oxrU/viewform?entry.556919704=NISTv2.19"
      else
        user_name = URI.encode_www_form_component(context.user.full_name)
        user_email = URI.encode_www_form_component(context.user.email)
        user_org = URI.encode_www_form_component(context.user.org.name)
        return "https://docs.google.com/forms/d/1cF0XoeGbLJUSRC3pvEz36DMdlpWA9nFwUXJA_o-oxrU/viewform?entry.764685280=#{user_name}&entry.1095215913=#{user_email}&entry.451016179=#{user_org}&entry.556919704=NISTv2.19"
      end
    else
      nil
    end
  end

  def deletable?
    return ((parent_type == "User") || (parent_type == "Job"))
  end

  def publishable_by?(context, scope_to_publish_to = "public")
    core_publishable_by?(context, scope_to_publish_to) && !parent_comparison? && state == "closed"
  end

  def rename(new_name, description, context)
    self.name = new_name
    self.description = description

    return false unless valid?

    if DNAnexusAPI.new(context.token).call(dxid, "rename", {project: project, name: new_name})
      update_attributes(name: new_name, description: description)
    else
      errors.add(:base, "File info could not be updated.")
      false
    end
  end

  def passes_consistency_check?(user)
    if private?
      if independent?
        return project == user.private_files_project
      else
        return project == user.private_comparisons_project
      end
    elsif public?
      return project == user.public_files_project
    else
      return project == space_object.project_for_user!(user)
    end
  end

  def created_by_challenge_bot?
    return true if challenge_resources.any?
    User.challenge_bot == user
  end

end

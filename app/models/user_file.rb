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
class UserFile < ActiveRecord::Base
  include Permissions
  include Licenses
  require 'uri'

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

  acts_as_commentable
  acts_as_taggable
  acts_as_votable

  def self.model_name
    ActiveModel::Name.new(self, nil, "File")
  end

  def self.real_files
    return where(parent_type: ['User', 'Job'])
  end

  def real_file?
    return parent_type == "User" || parent_type == "Job"
  end

  def to_param
    uid
  end

  def self.not_assets
    return where.not(parent_type: 'Asset')
  end

  def not_asset?
    return parent_type != "Asset"
  end

  def self.independent
    return where.not(parent_type: 'Comparison')
  end

  def independent?
    return parent_type != "Comparison"
  end

  def self.closed
    return where(state: 'closed')
  end

  def self.publication_project!(context, scope)
    # This is a class method for independent files.
    # For comparison files, use Comparison.publication_project!
    if scope == "public"
      context.user.public_files_project
    else
      Space.from_scope(scope).project_for_context!(context)
    end
  end

  def uid
    dxid
  end

  def title
    parent_type == "Asset" ? self.becomes(Asset).prefix : name
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
    core_publishable_by?(context, scope_to_publish_to) && parent_type != "Comparison" && state == "closed"
  end

  def rename(new_name, context)
    if DNAnexusAPI.new(context.token).call(dxid, "rename", {project: project, name: new_name})
      update_attributes(name: new_name)
    else
      false
    end
  end

  def passes_consistency_check?(context)
    if private?
      if independent?
        return project == context.user.private_files_project
      else
        return project == context.user.private_comparisons_project
      end
    elsif public?
      return project == context.user.public_files_project
    else
      return project == space_object.project_for_context!(context)
    end
  end

  def self.publish(files, context, scope)
    # Ensure API availability
    api = DNAnexusAPI.new(context.token)
    api.call("system", "greet")

    count = 0

    destination_project = UserFile.publication_project!(context, scope)

    projects = {}
    files.uniq.each do |file|
      next unless file.publishable_by?(context, scope)
      raise "Consistency check failure for file #{file.id} (#{file.dxid})" unless file.passes_consistency_check?(context)
      raise "Source and destination collision for file #{file.id} (#{file.dxid})" if destination_project == file.project
      projects[file.project] = [] unless projects.has_key?(file.project)
      projects[file.project].push(file)
    end

    projects.each do |project, project_files|
      api.call(project, "clone", {objects: project_files.map(&:dxid), project: destination_project})
      UserFile.transaction do
        project_files.each do |file|
          file.reload
          raise "Race condition for file #{file.id} (#{file.dxid})" unless file.publishable_by?(context, scope)
          file.update!(scope: scope, project: destination_project)
          count += 1
        end
      end
      api.call(project, "removeObjects", {objects: project_files.map(&:dxid)})
    end

    return count
  end
end

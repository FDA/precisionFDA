# == Schema Information
#
# Table name: comparisons
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  description :text(65535)
#  user_id     :integer
#  state       :string(255)
#  dxjobid     :string(255)
#  project     :string(255)
#  meta        :text(65535)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  scope       :string(255)
#  app_dxid    :string(255)      not null
#  run_input   :text(65535)
#

class Comparison < ApplicationRecord
  include Auditor
  include Permissions
  include CommonPermissions
  include Scopes
  include TagsContainer

  DESCRIPTION_MAX_LENGTH = 1000

  STATE_DONE = "done".freeze
  STATE_FAILED = "failed".freeze
  STATE_PENDING = "pending".freeze

  # comparison.user => returns the user who created the comparison
  belongs_to :user

  # comparison.inputs => returns the collection of ComparisonInput
  # objects associated with this comparison
  has_many :inputs, class_name: "ComparisonInput", dependent: :destroy

  # comparison.user_files => returns the collection of UserFile
  # objects which participated in this comparison
  has_many :user_files, through: :inputs

  # comparison.outputs => returns the UserFile objects that are
  # part of the comparison outputs. These UserFile objects have
  # 'parent' set to this comparison, hence do not participate
  # in usual UserFile queries as they don't match the default
  # scope of UserFile (which is set to 'parent_type != Comparison')
  has_many :outputs, class_name: "UserFile", dependent: :restrict_with_exception, as: 'parent'

  has_many :attachments, as: :item, dependent: :destroy
  has_many :notes, through: :attachments

  store :meta, coder: JSON
  store :run_input, coder: JSON

  acts_as_commentable
  acts_as_votable

  validates :name, presence: { message: "Name could not be blank" }
  validates :description,
            allow_blank: true,
            length: {
              maximum: DESCRIPTION_MAX_LENGTH,
              too_long: "Description could not be greater than #{DESCRIPTION_MAX_LENGTH} characters"
            }

  def uid
    "comparison-#{id}"
  end

  def title
    name
  end

  def klass
    "comparison"
  end

  def input(role)
    inputs.where(role: role).take
  end

  def input!(role)
    inputs.where(role: role).take!
  end

  def stats
    meta.slice("precision", "recall", "f-measure", "true-pos", "false-pos", "false-neg")
  end

  def describe_fields
    ["title", "description"]
  end

  def deletable?
    state != "pending"
  end

  def publishable_by?(context, _scope_to_publish_to)
    core_publishable_by?(context) && state == STATE_DONE
  end

  def rename(new_name, description, context)
    update_attributes(name: new_name, description: description)
  end

  def self.publication_project!(context, scope)
    if scope == SCOPE_PUBLIC
      context.user.public_comparisons_project
    else
      Space.from_scope(scope).project_for_user(context.user)
    end
  end

  def self.publish(comparisons, context, scope)
    # Ensure API availability
    api = DNAnexusAPI.new(context.token)
    api.call("system", "greet")

    count = 0

    destination_project = Comparison.publication_project!(context, scope)

    files = comparisons.uniq.select { |c| c.publishable_by?(context, scope) }.map(&:outputs).flatten

    comparisons_to_publish = []
    projects = {}
    comparisons.uniq.each do |comparison|
      next unless comparison.publishable_by?(context, scope)
      comparisons_to_publish << comparison
      comparison.outputs.to_a.flatten.each do |file|
        raise "Consistency check failure for file #{file.id} (#{file.dxid})" unless file.passes_consistency_check?(context.user)
        raise "Source and destination collision for file #{file.id} (#{file.dxid})" if destination_project == file.project
        projects[file.project] = [] unless projects.has_key?(file.project)
        projects[file.project].push(file)
      end
    end

    projects.each do |project, project_files|
      api.call(project, "clone", {objects: project_files.map(&:dxid), project: destination_project})
    end

    Comparison.transaction do
      comparisons_to_publish.each do |comparison|
        comparison.reload
        raise "Race condition for comparison #{comparison.id}" unless comparison.publishable_by?(context, scope)
        comparison.outputs.each do |file|
          file.update!(scope: scope, project: destination_project)
        end
        comparison.update!(scope: scope)
        count += 1
        if scope =~ /^space-(\d+)$/
          SpaceEventService.call($1.to_i, context.user_id, nil, comparison, :comparison_added)
        end
      end
    end

    projects.each do |project, project_files|
      api.call(project, "removeObjects", {objects: project_files.map(&:dxid)})
    end

    return count
  end

  def copyable_to_cooperative?
    in_confidential_space?
  end

  # Determine, whether a comparison is accessible by a user.
  # @param context [Context] A user context.
  # @return [Boolean] Returns true if user has access to a comparison, false otherwise.
  def accessible_by?(user)
    return false unless user&.logged_in?

    accessible_by_user?(user)
  end
end

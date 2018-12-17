class SpaceTemplate < ActiveRecord::Base

  has_many :space_template_nodes, dependent: :destroy
  accepts_nested_attributes_for :space_template_nodes

  has_many :spaces, :through => :space_template_spaces

  has_many :space_template_spaces, dependent: :destroy
  accepts_nested_attributes_for :space_template_spaces


  validates_length_of :name, :maximum => 255
  validates_length_of :description, :maximum => 21300

  belongs_to :user

  def self.all_and_private(context)
    t = arel_table
    where((t[:private].eq(true).and(t[:user_id].eq(context.user.id))).or(t[:private].eq(false)))
  end

  def self.private_first(context)
    all_and_private(context).order("created_at DESC, private ASC")
  end

  def files
    space_template_nodes.where(node_type: 'UserFile')
  end

  def apps
    space_template_nodes.where(node_type: 'App')
  end
end

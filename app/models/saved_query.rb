# == Schema Information
#
# Table name: saved_queries
#
#  id          :integer          not null, primary key
#  name        :string
#  grid_name   :string
#  query       :text
#  description :text
#  user_id     :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class SavedQuery < ActiveRecord::Base  #:nodoc:
  include Auditor

  belongs_to :user
  serialize :query

  validates_uniqueness_of :name, scope: :grid_name, on: :create, message: 'A query with this name already exists'

  validates_presence_of :name, message: 'Please submit the name of the custom query'

  acts_as_commentable

  # returns a list of all serialized queries
  def self.list(name, controller)
    conditions = { grid_name: name }
    self.where(conditions)
  end

  # returns a list of all serialized queries
  def self.my_list(name, controller)
    conditions = { grid_name: name }
    if controller.current_context # !
      conditions[:user_id] = controller.current_context.user_id
    end
    self.where(conditions)
  end
end

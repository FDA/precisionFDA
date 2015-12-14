# == Schema Information
#
# Table name: notes
#
#  id         :integer          not null, primary key
#  title      :string
#  content    :text
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  scope      :string
#

class Note < ActiveRecord::Base
  include Permissions

  belongs_to :user
  has_many :attachments, {dependent: :destroy}
  has_many :apps, {through: :attachments, source: :item, source_type: 'App'}
  has_many :comparisons, {through: :attachments, source: :item, source_type: 'Comparison'}
  has_many :jobs, {through: :attachments, source: :item, source_type: 'Job'}
  has_many :files, {through: :attachments, source: :item, source_type: 'UserFile'}

  def uid
    "note-#{id}"
  end

  def klass
    "note"
  end

  def to_param
    "#{id}-#{title.parameterize}"
  end

  def real_files
    files.real_files
  end

  def assets
    files.where(parent_type: "Asset")
  end

  def publishable_by?(context)
    if context.guest?
      false
    else
      user_id == context.user_id && scope != "public"
    end
  end
end

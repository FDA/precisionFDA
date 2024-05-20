# == Schema Information
#
# Table name: get_started_boxes
#
#  id                :integer          not null, primary key
#  title             :string(255)
#  feature_url       :string(255)
#  documentation_url :string(255)
#  description       :text(65535)
#  public            :boolean
#  kind              :integer          default("default")
#  position          :integer          default(0)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class GetStartedBox < ApplicationRecord

  enum kind: %i(default upload_file add_asset create_app launch_app run_comparison create_note)

  validates :title, :description, :feature_url, :documentation_url, presence: true

  scope :positioned, -> { order(position: :ASC, id: :ASC) }
  scope :visible, -> { where(public: true) }
  scope :invisible, -> { where(public: false) }

  def completed?(context)
    case kind
    when 'upload_file'    then UserFile.real_files.editable_by(context).any?
    when 'add_asset'      then Asset.editable_by(context).any?
    when 'create_app'     then App.editable_by(context).any?
    when 'launch_app'     then Job.editable_by(context).any?
    when 'run_comparison' then Comparison.editable_by(context).any?
    when 'launch_app'     then Note.real_notes.editable_by(context).any?
    else
      true
    end
  end

end

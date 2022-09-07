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
#  featured                :boolean          default(FALSE)
#  entity_type             :integer          default("regular"), not null
#

#
# To avoid creating another class, Asset is simply inherited from UserFile.
#
# An asset is a file archive (*.tar or *.tar.gz), together with a readme
# (stored in the "description" field of the UserFile model). The archive
# contents are stored using the ArchiveEntry model, and can be used for
# searching through assets in the UI.
#
class Asset < UserFile
  default_scope { where(parent_type: "Asset") }

  has_many :archive_entries, dependent: :delete_all

  has_and_belongs_to_many :apps, join_table: :apps_assets

  def self.model_name
    ActiveModel::Name.new(self, nil, "Asset")
  end

  def self.with_search_keyword(prefix)
    prefix = sanitize_sql_like(prefix)

    joins(:archive_entries).where(
      "(archive_entries.name LIKE ? OR nodes.name LIKE ?)",
      "#{prefix}%", "%#{prefix}%"
    )
  end

  def file_paths
    archive_entries.map(&:path).reject { |p| p.end_with?("/") }
  end

  def prefix
    name.chomp(".gz").chomp(".tar")
  end

  def suffix
    if name.ends_with?(".tar.gz")
      ".tar.gz"
    elsif name.ends_with?(".tar")
      ".tar"
    else
      raise "Found an asset that is not a .tar[.gz]"
    end
  end

  def gzipped?
    name.ends_with?(".gz")
  end

  def describe_fields
    %w(title name prefix description file_paths)
  end
end

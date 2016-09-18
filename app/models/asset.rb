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

  has_many :archive_entries, dependent: :destroy

  has_and_belongs_to_many :apps, {join_table: "apps_assets"}

  def self.model_name
    ActiveModel::Name.new(self, nil, "Asset")
  end

  def self.with_search_keyword(prefix)
    prefix = sanitize_sql_like(prefix)
    return joins(:archive_entries).where("(archive_entries.name LIKE ? OR user_files.name LIKE ?)", "#{prefix}%", "%#{prefix}%")
  end

  def file_paths
    archive_entries.map(&:path).reject { |p| p.end_with?("/") }
  end

  def prefix
    name.chomp(".gz").chomp(".tar")
  end

  def suffix
    if name.ends_with?(".tar.gz")
      return ".tar.gz"
    elsif name.ends_with?(".tar")
      return ".tar"
    else
      raise "Found an asset that is not a .tar[.gz]"
    end
  end

  def is_gzipped?
    return name.ends_with?(".gz")
  end

  def describe_fields
    ["title", "name", "prefix", "description", "file_paths"]
  end

end

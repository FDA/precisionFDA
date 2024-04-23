# Asset serializer.
class CliAssetSerializer < CliNodeSerializer
  attribute :uid
  attribute :created_at_date_time, key: :createdAtDateTime
  attribute :archive_content, key: :archiveContent
  attribute :file_license, key: :fileLicense
  attribute :properties_object, key: :properties

  # get array of asset archive_entries
  def archive_content
    object.file_paths
  end

  def properties_object
    props = {}
    object.properties.each do |prop|
      props[prop.property_name] = prop.property_value
    end
    props
  end

end

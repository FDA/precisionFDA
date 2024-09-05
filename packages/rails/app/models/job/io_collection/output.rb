class Job::IOCollection::Output < Job::IOCollection::Input

  def file
    return nil unless file?

    UserFile.find_by(dxid: value, project:) if project
  end

  def files
    return nil unless files?

    file_values = []
    value.each do |value_item|
      file_values << UserFile.find_by(dxid: value_item, project:) if project
    end
    file_values
  end

  private

  def project
    options.fetch(:project)
  end

end

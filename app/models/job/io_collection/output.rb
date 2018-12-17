class Job::IOCollection::Output < Job::IOCollection::Input

  def file
    return nil unless file?

    UserFile.find_by(dxid: value, project: project) if project
  end

  private

  def project
    options.fetch(:project)
  end

end

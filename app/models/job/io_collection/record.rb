class Job::IOCollection::Record

  attr_reader :value

  def initialize(spec, value)
    @spec = spec
    @value = value
  end

  def help
    spec[:help]
  end

  def label
    spec[:label] || name
  end

  def klass
    spec[:class]
  end

  def name
    spec[:name]
  end

  def file?
    klass == "file"
  end

  def file
    UserFile.find_by(dxid: value) if file?
  end

  private

  attr_reader :spec

end

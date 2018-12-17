class Job::IOCollection::Input

  attr_reader :value

  def initialize(spec, value, options)
    @spec = spec
    @value = value
    @options = options
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
    return nil unless file?

    UserFile.find_by_uid(value)
  end

  private

  attr_reader :spec, :options

end

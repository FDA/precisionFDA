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

    UserFile.find_by(uid: value)
  end

  def files?
    klass == "array:file"
  end

  def files
    return nil unless files?

    file_values = []
    if value.present?
      value.each do |value_item|
        file_values << UserFile.find_by(uid: value_item)
      end
    end
    file_values
  end

  private

  attr_reader :spec, :options

end

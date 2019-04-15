class DockerImage
  class DockerImageError < StandardError; end

  include ActiveModel::Validations

  validate :image_format_should_be_valid

  attr_reader :image_string

  class << self
    def from_filename(filename)
      raise DockerImageError.new("Only .tar.gz filename is allowed") unless filename =~ /\.tar\.gz$/

      splitted_filename = filename.sub(".tar.gz", "").split("_")

      namespace, repository, tag = splitted_filename

      formatted = {
        registry: nil,
        namespace: namespace,
        repository: repository,
        tag: tag || "latest",
      }

      new(formatted)
    end
  end

  def initialize(image_string_or_formatted)
    ivar = image_string_or_formatted.is_a?(Hash) ? :@formatted : :@image_string

    instance_variable_set(ivar, image_string_or_formatted)
  end

  def formatted
    @formatted ||= begin
      return {} unless image_string

      image_name, tag = image_string.match(/\A([^:]+):?([^:]+)?$/).try(:captures)

      image_name_parts = image_name.split("/")

      namespace, repository = image_name_parts.pop(2)
      registry = image_name_parts.first

      {
        registry: registry,
        namespace: namespace,
        repository: repository,
        tag: tag || "latest",
      }
    end
  end

  def local?
    formatted[:registry].nil?
  end

  def public?
    !local?
  end

  def ==(other)
    other.class == self.class && other.formatted == formatted
  end

  %i(registry namespace repository tag).each do |prop|
    define_method prop do
      formatted[prop]
    end
  end

  private

  def image_format_should_be_valid
    unless formatted.values.compact.size.between?(3, 4)
      errors.add(
        :base,
        "Docker image has incorrect format"
      )
    end
  end
end

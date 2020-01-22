class CwlPresenter
  extend ActiveModel::Translation
  include ActiveModel::Validations

  VALID_TYPES = %w(string long File boolean double int)

  validates :id,
    format: {
      with: /\A[a-zA-Z0-9._-]+\z/,
      message: "can contain only letters, digits or symbols ._-",
    }
  validates :base_command, presence: { message: "doesn't exist" }
  validates :inputs, :outputs, presence: { message: "are invalid or don't exist" }
  validate :validate_io_objects
  validate :validate_requirements

  attr_reader :docker, :docker_image
  attr_accessor :asset

  def initialize(cwl_string)
    @cwl_string = cwl_string.strip
    cwl_hash = YAML.load(cwl_string)
    @cwl_data = cwl_hash.is_a?(Hash) ? cwl_hash : {}
  end

  def to_s
    @cwl_string
  end

  def base_command
    cwl_data["baseCommand"].join(" ") if cwl_data["baseCommand"]
  end

  def doc
    cwl_data["doc"].strip
  end

  def id
    cwl_data["id"]
  end

  def label
    cwl_data["label"]
  end

  def inputs
    @inputs ||= IOObject.build(cwl_data["inputs"])
  end

  def outputs
    @outputs ||= IOObject.build(cwl_data["outputs"])
  end

  private

  attr_reader :cwl_data

  def validate_requirements
    unless cwl_data["requirements"]
      errors.add(:requirements, "don't exist")
      return
    end

    validate_docker_requirements
  end

  def validate_docker_requirements
    docker_requirement =
      cwl_data["requirements"].find do |requirement|
        requirement["class"] == "DockerRequirement"
      end

    unless docker_requirement
      errors.add(:requirements, "with 'DockerRequirement' class don't exist")
      return
    end

    @docker = docker_requirement["dockerPull"]

    unless @docker
      errors.add(:docker_requirement, "doesn't include dockerPull")
      return
    end

    @docker_image = DockerImage.new(@docker)

    unless @docker_image.valid?
      @docker_image.errors.full_messages.each do |msg|
        errors.add("base", msg)
      end

      return
    end
  end

  def validate_io_objects
    if inputs.present?
      inputs.each do |input|
        unless VALID_TYPES.include?(input.type)
          errors.add(:inputs, "has an unsupported type '#{input.type}'")
        end
      end
    end

    if outputs.present?
      outputs.each do |output|
        unless VALID_TYPES.include?(output.type)
          errors.add(:outputs, "has an unsupported type '#{output.type}'")
        end
      end
    end
  end
end

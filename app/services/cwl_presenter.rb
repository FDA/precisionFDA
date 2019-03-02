class CwlPresenter
  extend ActiveModel::Translation
  include ActiveModel::Validations

  VALID_TYPES = %w(string long File boolean double int)

  validates :base_command, presence: { message: "doesn't exist" }
  validates :inputs, :outputs, presence: { message: "are invalid or don't exist" }
  validate :validate_io_objects
  validate :validate_requirements

  def initialize(cwl_string)
    @cwl_string = cwl_string
    cwl_hash = YAML.load(cwl_string)
    @cwl_data = cwl_hash.is_a?(Hash) ? cwl_hash : {}
  end

  def to_s
    @cwl_string
  end

  def base_command
    cwl_data['baseCommand'].join(' ') if cwl_data['baseCommand']
  end

  def doc
    cwl_data['doc']
  end

  def id
    cwl_data['id']
  end

  def label
    cwl_data['label']
  end

  def inputs
    @inputs ||= IOObject.build(cwl_data['inputs'])
  end

  def outputs
    @outputs ||= IOObject.build(cwl_data['outputs'])
  end

  private

  attr_reader :cwl_data

  def validate_requirements
    unless cwl_data['requirements']
      errors.add(:requirements, "don't exist")
      return
    end

    docker_requirement = cwl_data['requirements'].select do |requirement|
      requirement['class'] == 'DockerRequirement'
    end.first

    unless docker_requirement
      errors.add(:requirements, "with 'DockerRequirement' class don't exist")
      return
    end

    unless docker_requirement['dockerPull']
      errors.add(:docker_requirement, "doesn't include dockerPull")
    end
  end

  def validate_io_objects
    if inputs.present?
      inputs.each do |input|
        errors.add(:inputs, "has an unsupported type '#{input.type}'") unless VALID_TYPES.include?(input.type)
      end
    end

    if outputs.present?
      outputs.each do |output|
        errors.add(:outputs, "has an unsupported type '#{output.type}'") unless VALID_TYPES.include?(output.type)
      end
    end
  end
end

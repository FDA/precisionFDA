# InputSpecPreparer checks input data on compatible with input specification specific app and
#   provides input_file_dxids, run_inputs, dx_run_input.
class InputSpecPreparer

  include ActiveModel::Validations

  attr_reader :errors

  def initialize(context)
    @context = context
    @errors = []
  end

  def run(app, inputs)
    @errors = []
    input_info = InputInfo.new

    app.input_spec.each do |input|
      key = input["name"]
      optional = input["optional"] == true
      has_default = input.has_key?("default")
      default = input["default"]
      klass = input["class"]
      choices = input["choices"]
      dxvalue = nil
      value = nil

      if inputs.has_key?(key)
        value = inputs[key]
      elsif has_default
        value = default
      elsif optional
        # No given value and no default, but input is optional; move on
        next
      else
        # Required input is missing
        add_error "#{key}: required input is missing"
        next
      end

      # Check compatibility with choices
      add_error "#{key}: incompatiblity with choices" if choices.present? && !choices.include?(value)

      case klass
      when "file"
        unless value.is_a?(String)
          add_error "#{key}: input file value is not a string"
          next
        end
        file = UserFile.real_files.accessible_by(@context).find_by(dxid: value)
        unless file
          add_error "#{key}: input file is not accessible or does not exist"
          next
        end
        add_error "#{key}: input file's license must be accepted" unless !file.license.present? || file.licensed_by?(@context)
        dxvalue = {"$dnanexus_link" => value}
        input_info.push_file(file)
      when "int"
        add_error "#{key}: value is not an integer" unless value.is_a?(Numeric) && (value.to_i == value)
        value = value.to_i
      when "float"
        add_error "#{key}: value is not a float" unless value.is_a?(Numeric)
      when "boolean"
        add_error "#{key}: value is not a boolean" unless value == true || value == false
      when "string"
        add_error "#{key}: value is not a string" unless value.is_a?(String)
      end

      input_info.push_run_input(key, value, dxvalue)
    end

    input_info
  end

  def first_error
    errors.first
  end

  def valid?
    errors.empty?
  end

  private

  attr_writer :errors

  def add_error(message)
    errors.push(message)
  end

end

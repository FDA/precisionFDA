require "wdl_object/parser"
require "wdl_object/task"
require "wdl_object/task/input"
require "wdl_object/task/output"

class WdlObject
  class Task
    include ActiveModel::Validations
    include ::Workflow::Common

    validates :name, presence: { message: "is not found!" }
    validates :command, presence: { message: "is not found!" }
    validates :runtime, presence: { message: "is not found!" }
    validates :docker, presence: { message: "is not found!" }
    validate :inputs_should_be_valid,
             :outputs_should_be_valid,
             :inputs_should_be_unique,
             :outputs_should_be_unique,
             :docker_image_should_be_valid

    attr_reader :raw
    attr_accessor :next_task, :prev_task

    def initialize(task_text)
      @raw = task_text
      @parser = Parser.new(@raw)
    end

    def name
      @name ||= parser.parse_task_name
    end

    def command
      @command ||= parser.parse_command
    end

    def runtime
      @runtime ||= parser.parse_runtime
    end

    def docker
      @docker ||= parse_docker
    end

    def docker_image
      @docker_image ||= (docker && DockerImage.new(docker))
    end

    def inputs
      @inputs ||= parser.parse_task_inputs.map do |input_string|
        Input.new(input_string)
      end
    end

    def outputs
      @outputs ||= parser.parse_task_outputs.map do |output_string|
        Output.new(output_string)
      end
    end

    def slot_name
      @slot_name ||= generate_slot_id
    end

    def next_slot
      next_task.try(:slot_name)
    end

    def prev_slot
      prev_task.try(:slot_name)
    end

    private

    attr_reader :parser

    def parse_docker
      runtime && runtime[%r{docker:\s*["']([\w\/:\-.]+)}, 1]
    end

    def inputs_should_be_valid
      inputs.each do |input|
        next if input.valid?
        input.errors.full_messages.each do |msg|
          errors.add("base", msg)
        end
      end
    end

    def outputs_should_be_valid
      outputs.each do |output|
        next if output.valid?
        output.errors.full_messages.each do |msg|
          errors.add("base", msg)
        end
      end
    end

    def inputs_should_be_unique
      items_should_be_unique(inputs.map(&:name), "input")
    end

    def outputs_should_be_unique
      items_should_be_unique(outputs.map(&:name), "output")
    end

    def items_should_be_unique(items, item_type)
      find_duplicates(items).each do |duplicate|
        errors.add("base", "Duplicate definitions for the #{item_type} named '#{duplicate}'")
      end
    end

    def docker_image_should_be_valid
      if docker_image && docker_image.invalid?
        docker_image.errors.full_messages.each do |msg|
          errors.add("base", msg)
        end
      end
    end

    def find_duplicates(items)
      items.select{ |item| items.count(item) > 1 }.uniq
    end
  end
end

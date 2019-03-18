require "wdl_object/parser"
require "wdl_object/task"
require "wdl_object/task/input"
require "wdl_object/task/output"

class WdlObject
  class Task
    include ActiveModel::Validations

    validates :name, presence: { message: "is not found!" }
    validates :command, presence: { message: "is not found!" }
    validates :runtime, presence: { message: "is not found!" }
    validates :docker, presence: { message: "is not found!" }
    validates :inputs, presence: { message: "are not found!" }
    validate :inputs_should_be_valid,
             :outputs_should_be_valid,
             :inputs_should_be_unique,
             :outputs_should_be_unique

    attr_reader :raw

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
      @docker ||= (runtime && runtime[%r{docker:\s*["']([\w\/:\-.]+)}, 1])
    end

    def docker_formatted
      return if docker.nil?

      @docker_formatted ||= begin
        image_name, tag = docker.match(/\A([^:]+):?([^:]+)?$/).try(:captures)

        image_name_parts = image_name.split("/")

        unless image_name_parts.size.between?(2, 3)
          errors.add(
            :base,
            "Docker image in task '#{name}' has incorrect format"
          )

          return
        end

        namespace, repository = image_name_parts.pop(2)
        registry = image_name_parts.first

        unless [namespace, repository].all?
          errors.add(
            :base,
            "Docker image in task '#{name}' has incorrect format"
          )

          return
        end

        {
          registry: registry,
          namespace: namespace,
          repository: repository,
          tag: tag || "latest",
        }
      end
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

    private

    attr_reader :parser

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

    def find_duplicates(items)
      items.select{ |item| items.count(item) > 1 }.uniq
    end
  end
end

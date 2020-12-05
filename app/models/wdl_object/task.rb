# == Schema Information
#
# Table name: tasks
#
#  id                  :integer          not null, primary key
#  user_id             :integer
#  space_id            :integer
#  assignee_id         :integer          not null
#  status              :integer          default("open"), not null
#  name                :string(255)
#  description         :text(65535)
#  response_deadline   :datetime
#  completion_deadline :datetime
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  response_time       :datetime
#  complete_time       :datetime
#

class WDLObject
  class Task
    include ActiveModel::Validations
    include ::Workflow::Common
    include WDLObject::Parseable
    include WDLObject::Validatable::InputsOutputs

    validates :name, presence: { message: "is not found!" }
    validates :command, presence: { message: "is not found!" }
    validates :runtime, presence: { message: "is not found!" }
    validates :docker, presence: { message: "is not found!" }

    validate :inputs_should_be_valid,
             :outputs_should_be_valid,
             :inputs_should_be_unique,
             :outputs_should_be_unique

    attr_reader :raw, :name
    alias_method :to_s, :raw

    attr_accessor :next_task, :prev_task

    def initialize(raw)
      @raw = raw
      @name = parse_section_identifier(raw, section_name)
    end

    def command
      @command ||= parse_section(raw, "command")
    end

    def runtime
      @runtime ||= parse_section(raw, "runtime")
    end

    def docker
      @docker ||= runtime && runtime[%r{docker:\s*["']([\w\/:\-.]+)}, 1]
    end

    def docker_image
      @docker_image ||= (docker && DockerImage.new(docker))
    end

    def inputs
      @inputs ||= parse_inputs(raw).map do |input_string|
        WDLObject::Input.new(input_string)
      end
    end

    def outputs
      @outputs ||= parse_outputs(raw).map do |output_string|
        WDLObject::Output.new(output_string)
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

    def section_name
      "task"
    end

    def docker_image_should_be_valid
      if docker_image && docker_image.invalid?
        docker_image.errors.full_messages.each do |msg|
          errors.add("base", msg)
        end
      end
    end
  end
end

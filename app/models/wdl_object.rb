require "wdl_object/workflow"
require "wdl_object/task"
require "wdl_object/errors"

# Wrapper class for a WDL
class WDLObject # rubocop:disable Metrics/ClassLength
  # rubocop:disable Metrics/AbcSize
  include ActiveModel::Validations
  extend ActiveModel::Translation
  include WDLObject::Parseable
  include WDLObject::Errors

  validates :workflow, presence: { message: "is not found!" }
  validates :tasks, presence: { message: "are not found!" }
  validate :tasks_should_be_valid,
           :workflow_should_be_valid,
           :calls_should_match_tasks

  attr_reader :raw, :tasks, :workflow

  def initialize(raw)
    @raw = raw.strip
    @workflow = create_workflow
    @tasks = create_tasks
  end

  def to_s(task_names = nil)
    return raw if task_names.blank?

    tasks_ary = []
    calls_ary = []

    tasks.each do |task|
      next unless task_names.include?(task.name)

      tasks_ary << "#{task.raw}\n\n"
      calls_ary << "  call #{task.name}\n"
    end

    output = ""
    output << tasks_ary.join
    output << "workflow #{workflow.name} {\n"
    output << calls_ary.join
    output << "}"

    output
  end

  private

  def create_tasks
    tsks = parse_tasks.map { |task_raw| WDLObject::Task.new(task_raw) }

    if workflow && workflow.valid? && tsks.all?(&:valid?)
      apply_io_mapping!(tsks)
      sort_tasks_by_calls!(tsks)
      apply_prev_next_links!(tsks)
    end

    tsks
  end

  def create_workflow
    (wf_raw = parse_workflow) && WDLObject::Workflow.new(wf_raw)
  end

  def parse_tasks
    parse_sections(raw, "task", with_identifier: true)
  end

  def parse_workflow
    parse_section(raw, "workflow", with_identifier: true)
  end

  def apply_io_mapping!(tsks) # rubocop:disable Metrics/MethodLength
    tsks.each do |task| # rubocop:disable Metrics/BlockLength
      call = workflow.calls.find { |c| c.name == task.name }

      raise WDLError, "Can't find a call statement for the task '#{task.name}'!" unless call

      call.input_mappings.each do |mapping|
        next unless mapping.link

        linked_task_name = mapping.link[:linked_task]
        linked_output_name = mapping.link[:linked_output]

        input = task.inputs.find { |inp| inp.name == mapping.input_name }

        unless input
          raise WDLError, "Can't find an input '#{mapping.input_name}' in the task " \
            "'#{task.name}' that is linked to the output '#{linked_output_name}' of another task " \
            "'#{linked_task_name}'"
        end

        # find another task that's linked to the current one
        linked_task = tsks.find { |tsk| tsk.name == linked_task_name }

        unless linked_task
          raise WDLError, "Can't find the task '#{linked_task_name} that's linked " \
            "with the task '#{task.name}' with this mapping: '#{mapping.expression}'"
        end

        linked_task_output = linked_task.outputs.find do |output|
          output.name == linked_output_name
        end

        unless linked_task_output
          raise WDLError, "Can't find the output '#{linked_output_name}' in the task " \
            "'#{linked_task.name}'"
        end

        # link input with output
        input.linked_output = linked_task_output
        input.linked_task = linked_task

        # link linked output with the current input
        linked_task_output.linked_input = input
        linked_task_output.linked_task = task
      end
    end
  end

  def sort_tasks_by_calls!(tsks)
    names = workflow.calls.map(&:name)
    tsks.sort_by! { |task| names.index(task.name) }
  end

  def apply_prev_next_links!(tsks)
    tsks.each_with_index do |task, idx|
      task.prev_task = tsks[idx - 1] if idx != 0
      task.next_task = tsks[idx + 1] if idx != tsks.size - 1
    end
  end

  def tasks_should_be_valid
    tasks.each do |task|
      next if task.valid?

      task.errors.full_messages.each do |msg|
        errors.add("base", "Task '#{task.name}': #{msg.downcase}")
      end
    end
  end

  def workflow_should_be_valid
    return if workflow.nil? || workflow.valid?

    workflow.errors.full_messages.each do |msg|
      errors.add("base", "Workflow '#{workflow.name}': #{msg.downcase}")
    end
  end

  def calls_should_match_tasks
    return if workflow.nil? || workflow.invalid? || tasks.any?(&:invalid?)

    cnames = workflow.calls.map(&:name)
    tnames = tasks.map(&:name)

    errors.add("base", "Call statements do not match task names!") if cnames.to_set != tnames.to_set
  end

  # rubocop:enable Metrics/AbcSize
end

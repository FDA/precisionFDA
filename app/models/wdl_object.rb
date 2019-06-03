require "wdl_object/workflow"
require "wdl_object/parser"
require "wdl_object/task"

class WdlObject
  include ActiveModel::Validations
  extend ActiveModel::Translation

  validates :tasks, presence: { message: "are not found!" }

  validate :tasks_should_be_valid,
           :workflow_should_be_valid,
           :tasks_should_have_prev_and_next_slots

  attr_reader :raw

  def initialize(wdl_text)
    @raw = wdl_text.strip
    @parser = Parser.new(@raw)
  end

  def workflow
    @workflow ||= (parsed = parser.parse_workflow) && Workflow.new(parsed)
  end

  def tasks
    @tasks ||= parser.parse_tasks.each_with_object([]) do |task_text, res|
      task = Task.new(task_text)

      if res.size > 0
        prev_task = res.last
        prev_task.next_task = task
        task.prev_task = prev_task
      end

      res << task
    end
  end

  # return just a raw text by default
  def to_s(names = nil)
    return raw if names.blank?

    output = ""
    output << workflow.raw if workflow

    tasks.each do |task|
      output << "\n #{task.raw}" if names.include?(task.name)
    end

    output
  end

  private

  attr_reader :parser

  def tasks_should_be_valid
    tasks.each do |task|
      next if task.valid?
      task.errors.full_messages.each do |msg|
        errors.add("base", "Task '#{task.name}': #{msg.downcase}")
      end
    end
  end

  def workflow_should_be_valid
    if workflow && workflow.invalid?
      workflow.errors.full_messages.each do |msg|
        errors.add("base", "Workflow #{msg.downcase}")
      end
    end
  end

  def tasks_should_have_prev_and_next_slots
    tasks.each do |task|
      if task == tasks.first
        errors.add("base", "Task '#{task.name}': should not have previous slot") if task.prev_slot
      elsif task == tasks.last
        errors.add("base", "Task '#{task.name}': should not have next slot") if task.next_slot
      else
        errors.add("base", "Task '#{task.name}': should have previous slot") unless task.prev_slot
        errors.add("base", "Task '#{task.name}': should have next slot") unless task.next_slot
      end
    end
  end
end

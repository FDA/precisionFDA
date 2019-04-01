require "wdl_object/workflow"
require "wdl_object/parser"
require "wdl_object/task"

class WdlObject
  include ActiveModel::Validations
  extend ActiveModel::Translation

  validates :tasks, presence: { message: "are not found!" }

  validate :tasks_should_be_valid, :workflow_should_be_valid

  attr_reader :raw

  def initialize(wdl_text)
    @raw = wdl_text.strip
    @parser = Parser.new(@raw)
  end

  def workflow
    @workflow ||= (parsed = parser.parse_workflow) && Workflow.new(parsed)
  end

  def tasks
    @tasks ||= parser.parse_tasks.map do |task_text|
      Task.new(task_text)
    end
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
end

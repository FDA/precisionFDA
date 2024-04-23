# Workflow diagram presenter to present data
# Used in HomeWorkflowsDiagram component
# It receives an instance of a Workflow
class WorkflowDiagramPresenter
  class << self
    def call(*args)
      new(*args).call
    end
  end

  def initialize(workflow)
    @workflow = workflow
  end

  def call
    {
      data: { stages: schema },
    }
  end

  private

  attr_accessor :workflow

  # Stage 1: [,...]
  # 0: {name: "app_1", prev_slot: null, next_slot: "stage-17097", slotId: "stage-4",}
  # 1: {name: "app_1", prev_slot: null, next_slot: "stage-17097", slotId: "stage-jiz",}
  # Stage 2: [,...]
  # 0: {name: "app_1", prev_slot: "stage-4", next_slot: null, slotId: "stage-17",}
  # 1: {name: "copier", prev_slot: "stage-4", next_slot: null, slotId: "stage-aj",}
  def schema
    workflow.spec.dig(:input_spec, :stages).group_by { |h| h[:stageIndex] }
  rescue StandardError => _e
    []
  end
end

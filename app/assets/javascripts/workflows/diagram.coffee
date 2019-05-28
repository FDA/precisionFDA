class StageModel
  addSlot: (slot) =>
    @slots.push(slot)

  constructor: (data, index) ->
    @index = ko.observable(index)
    @slots = ko.observableArray([])
    @title = ko.computed( => "Stage #{@index() + 1}")
    @addSlot(data)

class WorkflowDiagramModel
  getIndex: (stageIndex) ->
    return stageIndex if typeof stageIndex == 'number'
    return @stages().length

  constructor: (workflow) ->
    @stages = ko.observableArray([])
    if workflow?
      @noteAttachModel = new Precision.models.NoteAttachModel(workflow.id, 'Workflow')
      @readmeDisplay = Precision.md.render(workflow.readme)

      stages = workflow.spec.input_spec.stages || []
      stages.forEach((data) =>
        index = @getIndex(data.stageIndex)
        stage = @stages()[index]
        if stage
          stage.addSlot(data)
        else
          @stages.push(new StageModel(data, index))
      )


window.Precision ||= {}
window.Precision.WorkflowDiagramModel = WorkflowDiagramModel

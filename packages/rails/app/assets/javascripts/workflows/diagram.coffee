Y2 = 80 # 85 is svg height

class ArrowData
  findFromPosition: () ->
    @fromNode.offsetLeft - @fromNode.offsetWidth + 3

  findToPosition: () ->
    @toNode.offsetLeft - @toNode.offsetWidth

  constructor: (@svgNode, @fromNode, @toNode) ->

class ArrowsSVGModel
  renderArrows: () =>
    return false if @rendered
    @rootNode = $('.wf-diagram-stages')
    @ioNodes = @rootNode.find('[data-slot-id]').toArray()
    @ioNodes.forEach((node) =>
      if node.getAttribute('data-type') == 'output'
        @outputs.push(node)
      else
        @inputs.push(node)
    )
    @outputs.forEach((output) =>
      index = output.getAttribute('data-stage-index')
      svgNode = @rootNode.find("""svg[data-stage-index="#{index}"]""").first()[0]
      parentSlot = output.getAttribute('data-slot-id')
      outputName = output.getAttribute('data-output-name')
      @inputs.filter((input) ->
        parseInt(input.getAttribute('data-stage-index')) == parseInt(index) + 1
      ).forEach((input) =>
        outputStageId = input.getAttribute('data-value-id')
        inputName = input.getAttribute('data-value-name')
        if parentSlot == outputStageId and outputName == inputName
          @arrowData.push(new ArrowData(svgNode, output, input))
      )
    )
    @arrowData().forEach(@drawArrow)
    @rendered = true

  drawArrow: (arrow) =>
    color = '#1F70B5'
    from = arrow.findFromPosition()
    to = arrow.findToPosition()
    @drawLine(arrow.svgNode, from, to, color)
    @drawCircle(arrow.svgNode, from + 1, 3, color)
    @drawCircle(arrow.svgNode, to, Y2, color)

  drawCircle: (svgNode, x, y, color) ->
    circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttributeNS(null, 'cx', x)
    circle.setAttributeNS(null, 'cy', y)
    circle.setAttributeNS(null, 'r',  3)
    circle.setAttributeNS(null, 'fill', color)
    svgNode.appendChild(circle)

  drawLine: (svgNode, x1, x2, color) ->

    path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    delta = Math.abs(x2 - x1) / 4
    y1 = 0
    y2 = Y2
    hx1 = x1
    hy1 = y1 + delta
    hx2 = x2
    hy2 = y2 - delta
    shape = "M #{x1} #{y1} C #{hx1} #{hy1} #{hx2} #{hy2} #{x2} #{y2}"

    path.setAttributeNS(null, 'd', shape)
    path.setAttributeNS(null, 'fill', 'none')
    path.setAttributeNS(null, 'stroke', color)
    svgNode.appendChild(path)

  constructor: (@stages) ->
    @rendered = false
    @rootNode = null
    @ioNodes = []
    @outputs = []
    @inputs = []
    @arrowData = ko.observableArray([])
    $('a[href="#workflow-diagram"]').on 'shown.bs.tab', @renderArrows

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

      @svgArrows = new ArrowsSVGModel(@stages)


window.Precision ||= {}
window.Precision.WorkflowDiagramModel = WorkflowDiagramModel

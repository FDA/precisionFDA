INPUT_TYPE = 'input'
OUTPUT_TYPE = 'output'

class IOModel
  prepareDataForSaving: () ->
    return {
      class: @class,
      defaultValues: @defaultValue,
      label: @label,
      name: @name,
      optional: @isOptional,
      parent_slot: @appData.slotId,
      requiredRunInput: @requiredRunInput,
      stageName: @appData.appName,
      default_workflow_value: @wfValue(),
      values: {
        id: @value().appID,
        name: @value().name
      }
    }

  setRequired: (data, e) =>
    checked = e.target.checked
    @requiredRunInput = checked
    @configured(checked)

  reset: () =>
    @setValAppID(null)
    @setValName(null)
    @inputValue(null)
    @wfValue(null)
    @configured(false)

    mappedInput = @mappedInput()
    if mappedInput
      mappedInput.setValAppID(null)
      mappedInput.setValName(null)
      mappedInput.mappedOutput(null)
      mappedInput.configured(false)

    mappedOutput = @mappedOutput()
    if mappedOutput
      mappedOutput.mappedInput(null)
      mappedOutput.setValAppID(null)
      mappedOutput.setValName(null)
      mappedOutput.configured(false)
      @mappedOutput(null)

  mapIO: (output) =>
    @setValAppID(output.appData.slotId)
    @setValName(output.name)
    @configured(true)
    @inputValue("#{output.name} (#{output.appData.appName})")

    output.mappedInput(@)
    output.setValAppID(@appData.slotId)
    output.setValName(@appData.appName)
    output.configured(true)
    @mappedOutput(output)

  setWFvalue: (value, label) =>
    label = label || value
    @wfValue(value)
    @inputValue(label)
    @configured(true)

  isConfiguredByDefault: () -> @requiredRunInput || @connected()

  setValAppID: (value = null) ->
    value = Object.assign({}, @value(), { appID: value })
    @value(value)

  setValName: (value = null) ->
    value = Object.assign({}, @value(), { name: value })
    @value(value)

  setDefaultWFValue: () =>
    if typeof @data.default_workflow_value != 'undefined'
      @setWFvalue(@data.default_workflow_value)
      return true
    if typeof @defaultValue != 'undefined'
      @setWFvalue(@defaultValue)
      return true
    return false

  constructor: (@data, @type, @stageIndex, @appData) ->
    @value = ko.observable({
      appID: @data.values?.id || null,
      name: @data.values?.name || null
    })
    @wfValue = ko.observable(null)

    @class = @data.class
    @classLabel = 'Type: ' + @class
    @defaultValue = @data.default
    @help = @data.help
    @label = @data.label
    @name = @data.name
    @title = @label || @name
    @isOptional = @data.optional

    @mappedInput = ko.observable(null)
    @mappedOutput = ko.observable(null)

    @requiredRunInput = !!@data.requiredRunInput
    @isRequired = ko.observable(@requiredRunInput)
    @inputValue = ko.observable(null)
    @connected = ko.computed(() => !!@value().appID)
    @configured = ko.observable(@isConfiguredByDefault())
    @valid = ko.computed(() =>
      if (@isOptional or @type == 'output') then true else @configured()
    )

    @style = ko.computed( => if @valid() then 'workflow-info' else 'workflow-warning')

    @setDefaultWFValue()


class SlotModel
  prepareDataForSaving: () ->
    return {
      dxid: @data.dxid,
      uid: @data.uid,
      name: @data.name,
      instanceType: @instanceType(),
      inputs: @inputs().map((input) -> input.prepareDataForSaving()),
      outputs: @outputs().map((output) -> output.prepareDataForSaving()),
      stageIndex: @stageIndex(),
      slotId: @slotId
    }

  getAppData: () ->
    return {
      slotId: @slotId,
      appID: @appID,
      appUID: @appUID,
      revision: @revision
      appName: @appName(),
      instanceType: @instanceType()
    }

  getSlotID: () ->
    if @data.slotId
      return @data.slotId
    else
      _slotId = Math.round((Math.pow(36, 14 + 1) - Math.random() * Math.pow(36, 14)))
      return 'stage-' + _slotId.toString(36).slice(1)

  constructor: (@data, @stageIndex) ->
    @slotId = @getSlotID()
    @appID = @data.dxid
    @appUID = @data.uid
    @appName = ko.observable(@data.name)
    @revision = @data.revision
    @instanceType = ko.observable(@data.instanceType || @data.spec.instance_type)

    inputs = @data.inputs || @data.spec.input_spec
    inputs = inputs.map((input) =>
      new IOModel(input, INPUT_TYPE, @stageIndex, @getAppData())
    )

    outputs = @data.outputs || @data.spec.output_spec
    outputs = outputs.map((output) =>
      new IOModel(output, OUTPUT_TYPE, @stageIndex, @getAppData())
    )
    @inputs = ko.observableArray(inputs)
    @outputs = ko.observableArray(outputs)

    @valid = ko.computed( =>
      invalidInputs = @inputs().filter((input) -> !input.valid())
      return !invalidInputs.length
    )

    @style = ko.computed( => if @valid() then 'configured' else 'unconfigured')

class StageModel
  addSlot: (slot) =>
    @slots.push(new SlotModel(slot, @index))

  removeSlot: (slot, e) =>
    slot.inputs().forEach((input) -> input.reset() if input.valid())
    slot.outputs().forEach((output) -> output.reset() if output.valid())
    @slots.remove(slot)

  constructor: (data, index) ->
    @index = ko.observable(index)
    @title = ko.computed( => "Stage #{@index() + 1}")
    @slots = ko.observableArray([])
    @addSlot(data)

    @isEmpty = ko.computed( => !@slots().length)

    @valid = ko.computed( =>
      invalidSlots = @slots().filter((slot) -> !slot.valid())
      return !invalidSlots.length
    )

    @renameSlots = ko.computed( =>
      slots = @slots()
      slots.forEach((slot, index) ->
        originalName = slot.data.name
        slotsCnt = 1
        sameSlots = slots.filter((childSlot, childIndex) ->
          if originalName == childSlot.data.name and index != childIndex
            childSlot.appName("#{originalName}-#{slotsCnt}")
            slotsCnt++
            return true
        )
        if sameSlots.length
          slot.appName("#{originalName}-#{slotsCnt}")
        else
          slot.appName(originalName)
      )
    )

window.Precision ||= {}
window.Precision.wfEditor ||= {}
window.Precision.wfEditor.StageModel = StageModel

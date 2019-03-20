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
      values: {
        id: @value?.appID,
        name: @value?.name
      }
    }

  setRequired: (data, e) =>
    checked = e.target.checked
    @requiredRunInput = checked
    @configured(checked)

  reset: () =>
    @inputValue(null)
    @configured(false)

    mappedInput = @mappedInput()
    if mappedInput
      mappedInput.value.appID = null
      mappedInput.value.name = null
      mappedInput.mappedOutput(null)
      mappedInput.configured(false)

    mappedOutput = @mappedOutput()
    if mappedOutput
      mappedOutput.mappedInput(null)
      mappedOutput.value.appID = null
      mappedOutput.value.name = null
      mappedOutput.configured(false)
      @mappedOutput(null)

  mapIO: (output) =>
    @value.appID = output.appData.slotId
    @value.name = output.name
    @configured(true)
    @inputValue(output.name)

    output.mappedInput(@)
    output.value.appID = @appData.slotId
    output.value.name = @appData.appName
    output.configured(true)
    @mappedOutput(output)

  isConfiguredByDefault: () -> @requiredRunInput || !!@value.appID

  constructor: (@data, @type, @stageIndex, @appData) ->
    @value = {
      appID: @data.values?.id || null,
      name: @data.values?.name || null
    }

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
    @configured = ko.observable(@isConfiguredByDefault())
    @valid = ko.computed(() =>
      if (@isOptional or @type == 'output') then true else @configured()
    )

    @style = ko.computed( => if @valid() then 'workflow-info' else 'workflow-warning')
    @setButtonText = ko.computed( => if @configured() then 'Reset' else 'Set')


class SlotModel
  prepareDataForSaving: () ->
    return {
      dxid: @data.dxid,
      uid: @data.uid,
      name: @data.name,
      instanceType: @instanceType(),
      inputs: @inputs().map((input) -> input.prepareDataForSaving()),
      outputs: @outputs().map((output) -> output.prepareDataForSaving()),
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
    @instanceType = ko.observable(@data.spec.instance_type)

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

window.Precision ||= {}
window.Precision.wfEditor ||= {}
window.Precision.wfEditor.StageModel = StageModel

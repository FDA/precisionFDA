extendFileInput = () ->
  @onSelectFileClick = (root, input) ->
    if root and typeof root.openSelectorModal == 'function'
      root.openSelectorModal(input)
    else
      Precision.alert.showAboveAll('Selector Modal must be attached to root model!')
  @clearFileValue = () =>
    @value(null)
    @pristine(false)
    @validate()
  @fileTitle = ko.observable('')
  @licenseToAccept = ko.observable()
  @getFileTitle = ko.computed( =>
    @fileTitle('loading title...')
    @valid(true)
    if typeof @value() == 'string'
      $.post('/api/describe', { uid: @value() }).then (fileInfo) =>
        @fileTitle(fileInfo.title)
        if fileInfo.license and fileInfo.user_license and !fileInfo.user_license.accepted
          @licenseToAccept({
            license: fileInfo.license,
            user_license: fileInfo.user_license
          })
    else
      @fileTitle('')
  )

extendBooleanInput = () ->
  @setBoolValueTrue = (value) =>
    @value(true)
    @valid(true)
  @setBoolValueFalse = (value) =>
    @value(false)
    @valid(true)

getDefault = (input) ->
  return input.defaultValues || input.default

class InputTemplateModel
  isEmpty: () ->
    nullVals = [undefined, null]
    return true if nullVals.indexOf(@value()) > -1
    return true if typeof @value() == 'string' and !@value().trim().length
    return false

  _validate: () ->
    valid = true
    valueIsNaN = isNaN(@value())
    isEmpty = @isEmpty()
    if @required and isEmpty
      valid = false
    if !isEmpty and @type == 'int' and (!Number.isInteger(parseFloat((@value()))) or valueIsNaN)
      valid = false
    if !isEmpty and @type == 'float' and valueIsNaN
      valid = false
    @valid(valid)
    return valid

  validate: () ->
    @_validate()

  _onChange: () ->
    @pristine(false)
    @valid(true)

  onChange: () ->
    @_onChange()

  _onKeyUp: () ->

  onKeyUp: () ->
    @_onKeyUp()

  getConvertedValue: () ->
    value = @value()
    return value if !value
    if @type == 'string'
      return value.toString()
    if @type == 'boolean'
      return value
    if @type == 'int'
      intVal = parseInt(value)
      return if !isNaN(intVal) then intVal else value
    if @type == 'float'
      floatVal = parseFloat(value)
      return if !isNaN(floatVal) then floatVal else value
    return value

  getValue: (input) ->
    return @choices()[0] if @hasChoices()
    return input.default_workflow_value || @defaultValue

  constructor: (input, @attrNameSuffix, pristine = false) ->
    @id = "#{input.stageName}_#{input.name}"
    @type = input.class
    @name = input.name
    @uniq_input_name = input.uniq_input_name
    @label = input.label || input.name
    @help = input.help
    @required = !input.optional
    @stageName = input.stageName
    @choices = ko.observableArray(input.choices || [])
    @hasChoices = ko.computed(() => !!@choices().length)
    @defaultValue = getDefault(input)
    @value = ko.observable(@getValue(input))
    @disabled = ko.observable(false)

    @valid = ko.observable(true)
    @pristine = ko.observable(pristine)
    @showErrorCss = ko.computed(() =>
      !@valid() and !@pristine()
    )

    @templateAttrName = "#{input.id}_#{@attrNameSuffix}"
    @template = do () =>
      switch @type
        when 'file' then return 'file'
        when 'boolean' then return 'boolean'
        else return 'default'
    extendBooleanInput.call(@) if @type == 'boolean'
    extendFileInput.call(@) if @type == 'file'

window.Precision ||= {}
window.Precision.appTemplate = {}
window.Precision.appTemplate.InputTemplateModel = InputTemplateModel

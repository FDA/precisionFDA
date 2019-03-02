class AutocompleteModel
  PREFIX = 'pfda-autocomplete'

  EVENTS = {
    CHANGE_EVENT: "#{PREFIX}.change",
    KEYUP: "#{PREFIX}.keyup",
    SETVALUE: "#{PREFIX}.setvalue"
  }

  createEvents = () -> {
    CHANGE_EVENT: new Event(EVENTS.CHANGE_EVENT),
    KEYUP: new Event(EVENTS.KEYUP),
    SETVALUE: new Event(EVENTS.SETVALUE)
  }

  dispatchEvent = (el, e, eName) ->
    el.dispatchEvent(e)
    $(el).trigger(eName)

  convertOptionValues = (options = []) ->
    simpleTypes = ['string', 'number', 'boolean']
    resOptions = []
    for option in options
      if simpleTypes.indexOf(typeof option) > -1
        resOptions.push({ value: option, label: option })
      if typeof option == 'object'
        resOptions.push({ value: (option.value || ''), label: option.label })
    return resOptions

  renderIcon = (type, side = 'left', hidden) ->
    icon = document.createElement('i')
    icon.setAttribute('class', "fa fa-#{type} #{PREFIX}--icon #{PREFIX}--icon-#{side}")
    icon.classList.add('hidden') if hidden
    icon.classList.add('fa-spin') if type == 'spinner'
    icon.setAttribute('aria-hidden', 'true')
    return icon

  renderOptionsArray = (_options = [], filter = '') ->
    options = convertOptionValues(_options)
    filter = filter.toLowerCase().trim()
    renderedOptions = []

    if options.length
      for option in options
        valStr = option.label.toString().toLowerCase().trim() if option
        if !filter.length or (valStr and filter.length and valStr.indexOf(filter) > -1)
          liNode = document.createElement('li')
          liNode.classList.add("#{PREFIX}--option")
          liNode.setAttribute('data-value', option.value)
          liNode.innerText = option.label
          renderedOptions.push(liNode)

    return renderedOptions

  renderOptionsContainer = (inputNode) ->
    width = inputNode.offsetWidth
    optionsContainer = document.createElement('ul')
    optionsContainer.classList.add("#{PREFIX}--options")
    optionsContainer.classList.add('hidden')
    optionsContainer.style.width = "#{width}px"
    return optionsContainer

  renderInputGroup = () ->
    inputGroup = document.createElement('div')
    inputGroup.classList.add('#{PREFIX}--input-group')
    return inputGroup

  renderRootNode = () ->
    rootNode = document.createElement('div')
    rootNode.classList.add("#{PREFIX}")
    rootNode.classList.add("#{PREFIX}--wrapper")
    return rootNode

  renderHiddenInput = (hiddenInput) ->
    hiddenInput.classList.add("#{PREFIX}--hidden")
    hiddenInput.setAttribute('type', 'hidden')
    return hiddenInput

  renderInputNode = (_inputNode) ->
    inputNode = document.createElement('input')
    inputNode.setAttribute('class', _inputNode.getAttribute('class'))
    inputNode.classList.add("#{PREFIX}--input")
    inputNode.setAttribute('placeholder', _inputNode.getAttribute('placeholder'))
    return inputNode

  updateOptions: (options = [], filter) ->
    $(@nodes.optionsContainer).empty()
    width = @nodes.inputNode.offsetWidth
    @nodes.optionsContainer.style.width = "#{width}px"
    options = renderOptionsArray(options, filter)
    if options.length
      $(@nodes.optionsContainer).append(options)
      @nodes.optionsContainer.classList.remove('hidden')

  clearInput: () =>
    @nodes.inputNode.value = ''
    @nodes.hiddenInput.value = ''
    @value = null
    @label = null
    @nodes.optionsContainer.classList.add('hidden')
    @nodes.clearIcon.classList.add('hidden')
    @dispatchInputEvent('CHANGE_EVENT')
    @dispatchInputEvent('SETVALUE')

  toggleClearIcon: (value) =>
    if !value or !value.length
      @nodes.clearIcon.classList.add('hidden')
    else
      @nodes.clearIcon.classList.remove('hidden')

  setValue: (value, label) =>
    allowedTypes = ['string', 'number', 'boolean']
    if allowedTypes.indexOf(typeof(value)) > -1
      @value = value.toString()
      @label = label || @value
      @nodes.inputNode.value = @label
      @toggleClearIcon(@label)
      @nodes.hiddenInput.value = @value
      @dispatchInputEvent('SETVALUE')

  onOptionClick: (e) =>
    if e.target.classList.contains("#{PREFIX}--option")
      @label = e.target.innerText
      @nodes.inputNode.value = e.target.innerText
      @nodes.optionsContainer.classList.add('hidden')
    @toggleClearIcon(@nodes.inputNode.value)
    @value = e.target.getAttribute('data-value')
    @nodes.hiddenInput.value = @value
    @dispatchInputEvent('SETVALUE')

  onKeyUp: (e) =>
    @dispatchInputEvent('KEYUP')
    value = e.target.value
    if !@isAsync or !value or !value.length
      @toggleClearIcon(value)
      @nodes.hiddenInput.value = ''

  onInputChange: (e) =>
    value = e.target.value
    if !value or !value.length
      @value = null
      @dispatchInputEvent('CHANGE_EVENT')
      @dispatchInputEvent('SETVALUE')
      return false
    if @isAsync
      @nodes.rootNode.classList.add("#{PREFIX}--loading")
      @params.getOptionsAsync(value).then((options) =>
        @nodes.rootNode.classList.remove("#{PREFIX}--loading")
        @toggleClearIcon(value)
        @updateOptions(options)
        @dispatchInputEvent('CHANGE_EVENT')
      )
    else
      @updateOptions(@params.options, value)
      @dispatchInputEvent('CHANGE_EVENT')

  hideOptionsOnPageClick: (e) =>
    classListStr = e.target.getAttribute('class') || ''
    notAutocomplete = classListStr.indexOf(PREFIX) < 0
    notHidden = !@nodes.optionsContainer.classList.contains('hidden')
    if notAutocomplete and notHidden
      @nodes.optionsContainer.classList.add('hidden')

  dispatchInputEvent: (event) ->
    dispatchEvent(@nodes.inputNode, @events[event], @eventNames[event])

  disabled: (disabled) ->
    if disabled
      $(@nodes.inputNode).attr('disabled', true)
    else
      $(@nodes.inputNode).removeAttr('disabled', true)

  init: () ->
    @events = createEvents()
    @eventNames = EVENTS

    @nodes = {}
    @nodes.rootNode = renderRootNode()
    @nodes.inputNode = renderInputNode(@params.inputNode)
    @nodes.hiddenInput = renderHiddenInput(@params.inputNode)
    @nodes.inputGroup = renderInputGroup()
    @nodes.searchIcon = renderIcon('search')
    @nodes.clearIcon = renderIcon('times', 'right', true)
    @nodes.spinnerIcon = renderIcon('spinner', 'right')

    $(@nodes.hiddenInput).after(@nodes.rootNode)
    $(@nodes.rootNode).append(@nodes.inputGroup)
    $(@nodes.inputGroup).append(@nodes.searchIcon)
    $(@nodes.inputGroup).append(@nodes.hiddenInput)
    $(@nodes.inputGroup).append(@nodes.inputNode)
    $(@nodes.inputGroup).append(@nodes.clearIcon)
    $(@nodes.inputGroup).append(@nodes.spinnerIcon)

    @nodes.optionsContainer = renderOptionsContainer(@nodes.inputNode)
    $(@nodes.rootNode).append(@nodes.optionsContainer)

    if @params.options
      options = renderOptionsArray(@params.options)
      $(@nodes.optionsContainer).append(options)

    onInputChangeDelayed = _.debounce(@onInputChange, 400)
    @nodes.inputNode.removeEventListener 'input', onInputChangeDelayed
    @nodes.inputNode.addEventListener 'input', onInputChangeDelayed
    @nodes.inputNode.removeEventListener 'focus', @onInputChange
    @nodes.inputNode.addEventListener 'focus', @onInputChange
    @nodes.inputNode.removeEventListener 'keyup', @onKeyUp
    @nodes.inputNode.addEventListener 'keyup', @onKeyUp

    @nodes.optionsContainer.removeEventListener 'click', @onOptionClick
    @nodes.optionsContainer.addEventListener 'click', @onOptionClick

    @nodes.clearIcon.removeEventListener 'click', @clearInput
    @nodes.clearIcon.addEventListener 'click', @clearInput

    document.body.removeEventListener 'click', @hideOptionsOnPageClick
    document.body.addEventListener 'click', @hideOptionsOnPageClick

  constructor: (@params = {}) ->
    @isAsync = typeof @params.getOptionsAsync == 'function'
    @init() if @params.inputNode
    @value = null
    @label = null
    @disabled(true) if @params.disabled

window.Precision ||= {}
window.Precision.autocomplete = AutocompleteModel

class PhoneInput
  validate: (countryCode = '') -> Precision.utils.validatePhoneNumber(@getValue(), countryCode)

  getFormattedValue: () -> @nodes.label.value

  getValue: () -> @nodes.input.value

  setValue: (value = '') ->
    value = value.toString() if typeof value != 'string'
    formatted = Precision.utils.formatToPhoneNumber(value)
    @nodes.label.value = formatted
    @nodes.input.value = Precision.utils.digitsOnly(formatted)

  createDOM: () ->
    container = document.createElement('div')
    container.classList.add 'pfda-phone-input'

    label = document.createElement('input')
    label.setAttribute 'type', 'text'
    label.classList.add 'pfda-phone-input-label'

    @input.classList.forEach (value) -> label.classList.add value
    @input.classList.forEach (value) => @input.classList.remove value
    @input.classList.add 'pfda-phone-input-value'

    if @input.readOnly
      label.setAttribute 'readonly', @input.readOnly
    if @input.disabled
      label.setAttribute 'disabled', @input.disabled
    if @input.required
      label.setAttribute 'required', @input.required

    $(@input).before(container)
    $(container).append(label)
    $(container).append(@input)

    @nodes = {
      label: label,
      container: container,
      input: @input
    }

  constructor: (@input, options = {}) ->
    @createDOM()
    @setValue(@input.value) if @input.value

    inputListener = _.debounce((e) =>
      e.preventDefault()
      @setValue(e.target.value)
      if typeof options.onChange == 'function'
        options.onChange(@getValue(), e)
    , 200)
    @nodes.label.addEventListener 'input', inputListener

window.Precision ||= {}
window.Precision.PhoneInput = PhoneInput

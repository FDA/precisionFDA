class Datepicker

  createDOM: ->
    @label_input = document.createElement('input')
    @label_input.classList = @input.classList
    @label_input.setAttribute 'name', @input.getAttribute 'name' + '_datepicker'
    @label_input.setAttribute 'type', 'text'
    @input.setAttribute 'type', 'hidden'
    @label_input.readOnly = @input.readOnly
    @label_input.required = @input.required
    $(@input).after(@label_input)

    @default_value = new Date(@input.value)
    $(@label_input).on 'dp.change', (e) =>
      @input.value = e.date

  constructor: (@input, @params) ->
    @createDOM()
    @datetimepicker = $(@label_input).datetimepicker({
      format: 'MM/DD/YYYY hh:mm A',
      date: @default_value
    })

window.Precision ||= {}
window.Precision.Datepicker = Datepicker
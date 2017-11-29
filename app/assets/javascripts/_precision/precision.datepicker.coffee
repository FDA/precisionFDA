class Datepicker

  formatDate = (moment_date) -> moment_date.format('MM/DD/YYYY hh:mm A')

  getValue: -> @input.value
  
  setValue: (moment_date) ->
    @input.value = moment_date.toISOString()
    @label.innerText = formatDate moment_date

  constructor: (@input, @params) ->

    bodyClickHandler = (e) =>
      if e.target != @label
        $(@input).data("DateTimePicker").hide()
        $('body').off 'click', bodyClickHandler

    addBodyListener = ->
      $('body').on 'click', bodyClickHandler
        
    createDOM = =>
      label = document.createElement('span')
      label.classList.add 'form-control'
      if @input.readOnly
        label.setAttribute 'readonly', @input.readOnly
      if @input.disabled
        label.setAttribute 'disabled', @input.disabled
      @input.setAttribute 'type', 'hidden'
      $(@input).after(label)
      return label

    @label = createDOM()
    
    value = @input.value
    @datetimepicker = $(@input).datetimepicker({
      date: new Date(value)
    })
    
    @input.value = value
    if @input.value
      @label.innerText = formatDate moment(new Date(@input.value))
    
    $(@input).on 'dp.change', (e) =>
      @setValue(e.date)

    $(@label).on 'click', =>
      $(@input).data("DateTimePicker").show()
      addBodyListener()

window.Precision ||= {}
window.Precision.Datepicker = Datepicker
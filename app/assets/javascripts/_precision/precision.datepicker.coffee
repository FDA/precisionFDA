class Datepicker

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
      @input.setAttribute 'type', 'hidden'
      $(@input).after(label)
      return label

    @label = createDOM()

    @datetimepicker = $(@input).datetimepicker()
    
    $(@input).on 'dp.change', (e) =>
      @input.value = e.date
      @label.innerText = e.date.format('MM/DD/YYYY hh:mm A')

    $(@label).on 'click', =>
      $(@input).data("DateTimePicker").show()
      addBodyListener()

window.Precision ||= {}
window.Precision.Datepicker = Datepicker
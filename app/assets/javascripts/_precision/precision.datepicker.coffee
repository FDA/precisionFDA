class Datepicker

  DEFAULT_FORMAT = 'MM/DD/YYYY hh:mm A Z'
  
  RETURN_FORMAT = 'YYYY-MM-DD hh:mm:ss A Z'

  dateFromDateString = (date_string) -> (new Date(date_string)).toISOString()

  formatDate = (moment_date, format = DEFAULT_FORMAT) -> moment_date.format(format)

  getValue: -> @input.getAttribute 'value'
  
  getMomentValue: -> @momentValue
  
  getReturnFormat: -> RETURN_FORMAT
  
  setValue: (moment_date = moment(), default_label) ->
    # $(@input).data("DateTimePicker").date(moment_date)
    @momentValue = moment_date
    value = moment_date.format(RETURN_FORMAT)
    @input.value = value
    @input.setAttribute 'value', value

    if typeof default_label == 'string'
      label = default_label
    else
      label = formatDate(moment_date, @params.format)

    @nodes.label.innerText = label

  show: ->
    $(@input).data("DateTimePicker").show()
  
  hide: ->
    $(@input).data("DateTimePicker").hide()
  
  minDate: (moment_date) ->
    $(@input).data("DateTimePicker").minDate(moment_date)
  
  maxDate: (moment_date) ->
    $(@input).data("DateTimePicker").maxDate(moment_date)

  constructor: (@input, @params = {}) ->

    bodyClickHandler = (e) =>
      if e.target != @nodes.label and e.target != @nodes.icon
        $(@input).data("DateTimePicker").hide()
        $('body').off 'click', bodyClickHandler

    addBodyListener = ->
      $('body').on 'click', bodyClickHandler
        
    createDOM = =>
      container = document.createElement('div')
      container.classList.add 'pfda-datetimepicker'

      label = document.createElement('span')
      label.classList.add 'form-control'
      label.classList.add 'pfda-datetimepicker-label'

      @input.classList.add 'pfda-datetimepicker-value'
      if @input.readOnly
        label.setAttribute 'readonly', @input.readOnly
      if @input.disabled
        label.setAttribute 'disabled', @input.disabled

      $(@input).before(container)
      $(container).append(label)
      $(container).append(@input)

      if @params.icon
        icon = document.createElement('span')
        icon.setAttribute 'class', 'pfda-datetimepicker-icon glyphicon glyphicon-calendar'
        container.classList.add('with-icon')
        $(container).append(icon)
      return {
        label: label,
        icon: icon,
        container: container,
        input: @input
      }

    @nodes = createDOM()
    
    # value = @input.value || formatDate moment(@params.defaultValue)
    value = $(@input).attr('value') || formatDate moment(@params.defaultValue)
    @datetimepicker = $(@input).datetimepicker({
      format: RETURN_FORMAT,
      defaultDate: @params.defaultValue || false
    })
    if $(@input).attr('value')
      @datetimepicker.data("DateTimePicker").date(value)
    else
      defaultLabel = @params.defaultLabel

    if !@params.noDefaultValue or $(@input).attr('value')
      @setValue moment(dateFromDateString(value)), defaultLabel
    
    $(@input).on 'dp.change', (e) =>
      @setValue(e.date)
      if typeof @params.onChange == 'function'
        @params.onChange(e)

    $(@nodes.label).on 'click', =>
      $(@input).data("DateTimePicker").show()
      addBodyListener()
    
    if @nodes.icon
      $(@nodes.icon).on 'click', =>
        $(@input).data("DateTimePicker").show()
        addBodyListener()

window.Precision ||= {}
window.Precision.Datepicker = Datepicker

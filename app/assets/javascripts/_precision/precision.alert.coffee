class AlertModel

  #public
  on: (container, delay = 5000) ->
    if !container
      container = $(".flash-alert")
    
    container.delay(delay).slideUp(500, ->
      container.alert('close')
      container = null
    )

  #public
  show: (text, style) ->
    $container = createNode(text, style)
    appendToPage($container)
    @on($container)

  #public
  showAboveAll: (text, style) ->
    $container = createNode(text, style)
    $container.addClass('above-all')
    appendToPage($container)
    @on($container, 10000)

  #private
  default_style = ''

  #private
  appendToPage = (container) ->
    if $('noscript').length > 0
      $('noscript').first?().after(container)
    else
      $('main').first?().prepend(container)

  #private
  createNode = (text, style) ->
    style = default_style if !style
    $container = $(document.createElement('div'))
    $container.addClass('text-center alert flash-alert fade in')
    $container.addClass(style)
    $container.attr('role', 'alert')
    $container.append(text)
    return $container

  constructor: () ->
    default_style = 'alert-danger'

window.Precision ||= {}
window.Precision.alert = new AlertModel()
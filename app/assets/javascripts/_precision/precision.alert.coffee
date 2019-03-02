class AlertModel

  #public
  on: (container, delay = 5000) ->
    if !container
      container = $(".flash-alert")

    if delay > 0
      container.delay(delay).slideUp(500, ->
        container.alert('close')
        container = null
      )

  #public
  show: (text, style) ->
    $container = createContainer(text, style)
    appendToPage($container)
    @on($container)

  #public
  showAboveAll: (text, style = 'alert-danger', delay = 10000) ->
    $container = createContainer(text, style)
    $container.addClass('above-all')
    appendToPage($container)
    @on($container, delay)

  #public
  showPermanent: (text, style) ->
    $container = createNode(text, style)
    $container.addClass('above-all')
    appendToPage($container)
    @on($container, -1)

  #private
  default_style = ''

  #private
  appendToPage = (container) ->
    if $('noscript').length > 0
      $('noscript').first?().after(container)
    else
      $('main').first?().prepend(container)

  #private
  createContainer = (text, style) ->
    style = default_style if !style
    $container = createNode('text-center alert flash-alert fade in')
    $container.addClass(style)
    $container.attr('role', 'alert')
    $container.append(text)
    return $container

  #private
  createNode = (css = '', node = 'div', child = null) ->
    $node = $(document.createElement(node))
    $node.addClass(css)
    $node.append(child) if child
    return $node

  constructor: () ->
    default_style = 'alert-danger'

window.Precision ||= {}
window.Precision.alert = new AlertModel()

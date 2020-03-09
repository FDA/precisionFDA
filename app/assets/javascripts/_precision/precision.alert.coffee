STORAGE_ITEMS = 'precision_fda_alert_msgs'

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
    $container.on 'click', (e) ->
      $container.alert('close')
      $container = null
    @on($container, delay)

  #public
  showPermanent: (text, style) ->
    $container = createContainer(text, style)
    appendToPage($container)
    $container.on 'click', (e) ->
      $container.alert('close')
      $container = null
    @on($container, -1)

  #public
  showAfterReload: (text, style, above) ->
    items = Precision.localStorage.get(STORAGE_ITEMS) || []
    items.push({ text: text, style: style, above: above })
    Precision.localStorage.set(STORAGE_ITEMS, items)

  #public
  clearStorageItems: () ->
    Precision.localStorage.set(STORAGE_ITEMS, [])

  #public
  showIfStored: () =>
    items = Precision.localStorage.get(STORAGE_ITEMS) || []
    if items.length
      items.forEach((item) =>
        @showPermanent(item.text, item.style) if !item.above
        @showAboveAll(item.text, item.style) if item.above
      )
      @clearStorageItems()

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
    $('document').ready(() => @showIfStored())

window.Precision ||= {}
window.Precision.AlertModel = AlertModel

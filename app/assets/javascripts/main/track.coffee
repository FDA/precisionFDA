#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MainController = Paloma.controller('Main', {
  track: ->
    if typeof window.trackPageDrawGraph == 'function'
      window.trackPageDrawGraph()
})
